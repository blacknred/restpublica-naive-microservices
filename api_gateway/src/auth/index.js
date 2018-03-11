/* eslint-disable no-return-assign */
const { request } = require('../services');
const { genApiSecret } = require('./local');
const redis = require('redis');
const bluebird = require('bluebird');

const client = redis.createClient(6379, 'redis-cache');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

/*
Register consumers requests: users or apps.

- At first we implement rateLimitPolicy.
    Every consumer has limitation on count of requests at pariod
    to prevent Denial of Service (DoS) attacks and memory exhaustation.
    Additionally partner apps (which needs much more traffic)
    might have higher limits based on partner api plan.
    The concept:
    - There are ip counters and blockers strings in Redis with EXPIRE
    functionality that allows avoid having to handle all the timing stuff.
    - Initialy check if there is a "blocked" consumer ip
    - Check if there is a "counter" for consumer ip
    - If there is not such counter yet set new "counter" with expire
    time-span (in case of app use 'Partners API' microservice
    for requests limit based on api plan)
    - Count the requests of individual consumer over a defined time-span
    - Set the counter to zero after the time-span is over
    - If the consumer excesses the limit of requests within the time-span,
    block any subsequent requests
    - Accept requests again after a freeze period of 5 minutes
    - if consumer logout or changed api_plan - remove ip data from redis
    - if all ok - set default not authorized consumer:
    ctx.state.consumer = 0(success flag)

- In case of secure API routes needs to implement authentication.
    - In case of app - check api_secret.
    There is not change: ctx.state.consumer = 0
    - In case of user - get user id from Users microservice
    and set authorized consumer: ctx.state.consumer = user_id

- Create a short-lived token for related microservices access
    ctx.state.consumer === 0 - non authorized request
    ctx.state.consumer > 0 - authorized request(user id)
    else - breaks request
*/

const rateLimitPolicy = async (ctx, next) => {
    if (process.env.NODE_ENV === 'test') {
        ctx.state.consumer = 0;
        await next();
    }
    // "freeze" period in sec
    const blockingTimespan = 600;
    // time-span to count the requests in sec
    const watchingTimespan = 60 * 30;
    // default requests limit
    const defaultLimit = 50;
    // compose key for identifying blocked ips
    const blockedIp = `blocked_ip_${ctx.ip}`;
    // compose key for counting requests
    const ipCounter = `ip_requests_counter_${ctx.ip}`;
    // compose key for identifying limit of requests(consumer-app)
    const ipRequestsLimit = `ip_requests_limit_${ctx.ip}`;
    const limitMessage = `API requests limit is reached. Try later or change API plan.`;
    try {
        // check if there is a "blocked" ip
        const isIpBlocked = await client.getAsync(blockedIp);
        if (isIpBlocked) throw new Error(limitMessage);
        // check if there is ip counter
        let cnt = await client.getAsync(ipCounter);
        if (cnt) {
            // increment ip counter
            await client.incr(ipCounter);
            // get requests limit for ip
            const requestsLimit = await client.getAsync(ipRequestsLimit) || defaultLimit;
            // check limit
            if (++cnt > requestsLimit) {
                // mark the consumer ip as "blocked"
                // expiring itself after the defined freeze period
                client.set(blockedIp, 1);
                client.expire(blockedIp, blockingTimespan);
                throw new Error(limitMessage);
            }
        } else {
            // set a new counter with ttl
            const apiKey = ctx.headers.api_key;
            const apiSecret = ctx.headers.api_secret;
            if (typeof apiKey !== 'undefined' && typeof apiSecret !== 'undefined') {
                // call partners service: check api_key and domain matching in db
                ctx.state.method = 'POST';
                ctx.state.body = {
                    api_key: apiKey,
                    domain: ctx.request.origin
                };
                const url = '/api/v1/apps/check';
                const res = await request(ctx, ctx.partners_host, url, true);
                try {
                    if (typeof res.limit !== 'number') throw new Error();
                    // set requests limit
                    client.set(ipRequestsLimit, res.data.limit);
                } catch (err) {
                    ctx.throw(401, 'Invalid API key');
                }
            }
            client.set(ipCounter, 1);
            client.expire(ipCounter, watchingTimespan);
        }
        // set success request flag
        ctx.state.consumer = 0;
    } catch (err) {
        ctx.throw(429, err.message);
    }
    await next();
};

const authentication = async (ctx, next) => {
    if (process.env.NODE_ENV === 'test') {
        ctx.state.consumer = 1;
        await next();
    }
    const apiKey = ctx.headers.api_key;
    const apiSecret = ctx.headers.api_secret;
    // app auth: check api_secret
    if (typeof apiKey !== 'undefined' && typeof apiSecret !== 'undefined') {
        try {
            if (apiSecret !== genApiSecret(apiKey)) throw new Error();
        } catch (e) {
            ctx.throw(401, 'Invalid API secret token');
        }
    } else {
        // user auth: check user id from users service
        try {
            const userToken = ctx.headers.authorization.split(' ')[1];
            if (typeof userToken === 'undefined') throw new Error();
            const url = '/users/check';
            ctx.state.method = 'GET';
            ctx.state.userAuthToken = userToken;
            const res = await request(ctx, ctx.users_host, url, true);
            if (typeof res.user !== 'number') throw new Error();
            ctx.state.consumer = res.user;
            delete ctx.state.method;
        } catch (err) {
            ctx.throw(401, 'Please log in');
        }
    }
    await next();
};

module.exports = {
    rateLimitPolicy,
    authentication
};

