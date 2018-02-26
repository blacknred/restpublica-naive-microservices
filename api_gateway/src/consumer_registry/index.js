/* eslint-disable no-return-assign */
const axios = require('axios');
const redis = require('redis');
const bluebird = require('bluebird');
const { encodeToken, genApiSecret } = require('./local');

const client = redis.createClient(6379, 'redis-cache');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
client.on('ready', async () => {
    const keys = await client.keysAsync('*');
    console.log(`keys ${keys.length}:`);
    keys.forEach(async (key) => {
        const val = await client.getAsync(key);
        console.log(`${key} - ${val}`);
    });
});

/*
    Here we register consumers requests: users or apps.

** At first we implement rateLimitPolicy. **
    Every consumer has limitation on count of requests at hour to prevent
    Denial of Service (DoS) attacks and memory exhaustation.
    Additionally partner apps (which needs much more traffic)
    might have higher limits based on partner api plan.
    The concept:
    - There are separated cnt_ip and ban_ip strings in Redis with EXPIRE
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
    - if all ok - set default consumer: ctx.state.consumer = 0(success flag)

** In case of secure API routes needs to implement authentication. **
    - In case of app - check api_secret
    - In case of user - get user_id from Users microservice and
    set it to ctx.state.consumer(user_id flag)
    - If authentication fails set ctx.state.consumer = null(failure flag)
    for prevent token generating

** Finally create a short-lived token **
    If ctx.state.consumer !== null (restricted flag) generate
    a short-lived token for related microservices access
*/

const rateLimitPolicy = async (ctx, next) => {
    if (process.env.NODE_ENV === 'test') {
        ctx.state.consumer = 0;
        await next();
    }
    // "freeze" period in seconds
    const blockingTimespan = 600;
    // time-span to count the requests(1 hour)
    const watchingTimespan = 60 * 30;
    // default requests limit
    const defaultRequestLimit = 50;
    // compose key for identifying blocked ips
    const blockedIp = `blocked_ip_${ctx.ip}`;
    // compose key for counting requests
    const ipCounter = `ip_requests_counter_${ctx.ip}`;
    // compose key for identifying limit of requests(consumer-app)
    const ipRequestsLimit = `ip_requests_limit_${ctx.ip}`;
    const limitMessage = `API requests limit is reached. Try later or change API plan.`;
    try {
        // check if there is a "blocked" ip
        const isBlocked = await client.getAsync(blockedIp);
        if (isBlocked) throw new Error(limitMessage);
        // check if there is ip counter
        let cnt = await client.getAsync(ipCounter);
        if (cnt) {
            // increment ip counter
            await client.incr(ipCounter);
            // get requests limit for ip
            const requestsLimit = await client.getAsync(ipRequestsLimit) || defaultRequestLimit;
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
                // call partner api: check api_key and domain matching in db
                const options = {
                    method: 'POST',
                    url: `${ctx.partner_host}/api/v1/apps/check`,
                    headers: { Authorization: `Bearer ${encodeToken()}` },
                    body: {
                        api_key: apiKey,
                        domain: ctx.request.origin
                    },
                    validateStatus: status => status >= 200,
                };
                const res = await axios(options);
                if (res.data.status === 'error') throw new Error('Consumer app is not found');
                // set requests limit
                client.set(ipRequestsLimit, res.data.data);
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
    // app auth
    if (typeof apiKey !== 'undefined' && typeof apiSecret !== 'undefined') {
        try {
            // check api_secret
            if (apiSecret !== genApiSecret(apiKey)) throw new Error();
            ctx.state.consumer = 0;
        } catch (err) {
            ctx.throw(401, 'Invalid API secret');
        }
    } else {
        // user auth
        try {
            // get user id from users service
            const authHeader = ctx.headers.authentication;
            if (typeof authHeader === 'undefined') throw new Error();
            const options = {
                method: 'GET',
                url: `${ctx.users_host}/api/v1/users/check`,
                headers: { Authorization: `Bearer ${authHeader.split(' ')[1]}` }
            };
            const user = await axios(options);
            ctx.state.consumer = user.id || 0;
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

