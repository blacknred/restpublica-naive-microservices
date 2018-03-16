/* eslint-disable no-return-assign */
const { request } = require('../routes/_helpers');
const { users_api, partners_api } = require('../adresses');
const { genApiSecret } = require('./local');
const redis = require('redis');
const bluebird = require('bluebird');

const client = redis.createClient(6379, 'redis-cache');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);


/*
RateLimitPolicy.
Every consumer has limitation on count of requests at period
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
*/
const rateLimitPolicy = async (ctx, next) => {
    if (process.env.NODE_ENV === 'test') {
        ctx.state.consumer = 0;
        await next();
    }
    // "freeze" period in sec
    const blockingTimespan = 600;
    // time-span to count the requests in sec
    const watchingTimespan = 60 * 10;
    // default requests limit
    const defaultLimit = 50;
    // compose key for identifying blocked ips
    const blockedIp = `blocked_ip_${ctx.ip}`;
    // compose key for identifying partner ips
    // const partnerIp = `partner_ip_${ctx.ip}`;
    // compose key for counting requests
    const ipCounter = `ip_requests_counter_${ctx.ip}`;
    // compose key for identifying limit of requests(consumer-app)
    const ipLimit = `ip_requests_limit_${ctx.ip}`;
    const message = `API requests limit is reached. Try later or change API plan.`;

    // check if ip is blocked
    try {
        const isIpBlocked = await client.getAsync(blockedIp);
        if (isIpBlocked) throw new Error(message);
    } catch (err) {
        ctx.throw(429, err.message);
    }

    // // set ipLimit & ipCounter
    // // check if there is a api partner credentials
    // const apiKey = ctx.headers.api_key || null;
    // const apiSecret = ctx.headers.api_secret || null;
    // if (apiKey && apiSecret) {
    //     // check ip as partner app
    //     const isPartnerIp = await client.getAsync(partnerIp);
    //     if (!isPartnerIp) {
    //         // check api_key and domain in partners service
    //         try {
    //             ctx.state.method = 'POST';
    //             ctx.state.body = {
    //                 api_key: apiKey,
    //                 domain: ctx.request.origin
    //             };
    //             const res = await request(ctx, partners_api, '/apps/check', true);
    //             if (typeof res.data.limit !== 'number') throw new Error();
    //             // set requests limit & counter
    //             client.set(partnerIp, 1);
    //             client.set(ipLimit, parseInt(res.data.limit, 10));
    //             client.set(ipCounter, 1);
    //             client.expire(ipCounter, watchingTimespan);
    //         } catch (err) {
    //             ctx.throw(401, 'Invalid API key');
    //         }
    //     }
    // } else {
    //     // check ip as user
    //     const cnt = await client.getAsync(ipCounter);
    //     if (!cnt) {
    //         client.set(ipCounter, 1);
    //         client.expire(ipCounter, watchingTimespan);
    //     }
    // }

    // // process rate/limit
    // try {
    //     let cnt = await client.getAsync(ipCounter);
    //     // increment ip counter
    //     await client.incr(ipCounter);
    //     // get requests limit for ip
    //     const requestsLimit = await client.getAsync(ipLimit) || defaultLimit;
    //     // check limit
    //     if (++cnt > requestsLimit) {
    //         // mark the consumer ip as "blocked"
    //         // expiring itself after the defined freeze period
    //         client.set(blockedIp, 1);
    //         client.expire(blockedIp, blockingTimespan);
    //         throw new Error(message);
    //     }
    // } catch (err) {
    //     ctx.throw(429, err.message);
    // }

    // check if there is ip counter
    let cnt = await client.getAsync(ipCounter);
    if (cnt) {
        try {
            // increment ip counter
            await client.incr(ipCounter);
            // get requests limit for ip
            const requestsLimit = await client.getAsync(ipLimit) || defaultLimit;
            // check limit
            if (++cnt > requestsLimit) {
                // mark the consumer ip as "blocked"
                // expiring itself after the defined freeze period
                client.set(blockedIp, 1);
                client.expire(blockedIp, blockingTimespan);
                throw new Error(message);
            }
        } catch (err) {
            ctx.throw(429, err.message);
        }
    } else {
        // set a counter with ttl for app
        const apiKey = ctx.headers.api_key || null;
        const apiSecret = ctx.headers.api_secret || null;
        if (apiKey && apiSecret) {
            // call partners service: check api_key and domain matching in db
            try {
                ctx.state.method = 'POST';
                ctx.state.body = {
                    api_key: apiKey,
                    domain: ctx.request.origin
                };
                const res = await request(ctx, partners_api, '/apps/check', true);
                if (typeof res.data.limit !== 'number') throw new Error();
                delete ctx.state.method;
                // set requests limit
                client.set(ipLimit, parseInt(res.data.limit, 10));
            } catch (err) {
                ctx.throw(401, 'Invalid API key');
            }
        }
        // set a counter with ttl for user
        client.set(ipCounter, 1);
        client.expire(ipCounter, watchingTimespan);
    }
    // set success non authorised request flag
    ctx.state.consumer = 0;
    await next();
};

/*
If there are auth headers in request, check them:
- In case of app - check if api_secret is valid.
    There is not change: ctx.state.consumer = 0
- In case of user - get user id from Users microservice
    and set authorized consumer: ctx.state.consumer = user_id
*/
const authentication = async (ctx, next) => {
    if (process.env.NODE_ENV === 'test') {
        ctx.state.consumer = 1;
        await next();
    }
    const apiKey = ctx.headers.api_key;
    const apiSecret = ctx.headers.api_secret;
    if (typeof apiKey !== 'undefined' && typeof apiSecret !== 'undefined') {
        // app auth: check api_secret
        try {
            if (apiSecret !== genApiSecret(apiKey)) throw new Error();
        } catch (e) {
            ctx.throw(401, 'Invalid API secret token');
        }
    } else if (ctx.headers.authorization) {
        // user auth: check user id from users service
        const userToken = ctx.headers.authorization.split(' ')[1];
        if (typeof userToken === 'undefined') return;
        ctx.state.method = 'GET';
        ctx.state.userAuthToken = userToken;
        const res = await request(ctx, users_api, '/users/check', true);
        if (typeof res.user !== 'number') return;
        ctx.state.consumer = parseInt(res.user, 10);
        delete ctx.state.method;
    }
    await next();
};

/* Restrict non authorised requests on secure API endpoints */
const auth = async (ctx, next) => {
    if (!ctx.state.consumer > 0) ctx.throw(401, 'Please log in');
    await next();
};

/* Check admin for administration endpoints */
const admin = async (ctx, next) => {
    ctx.state.method = 'GET';
    const res = await request(ctx, users_api, '/users/check/admin', true);
    if (!res.admin) ctx.throw(401, 'Access is restricted');
    delete ctx.state.method;
    await next();
};

/* Clear Rate Limit on user logout */
const clearRateLimit = async (ctx, next) => {
    // /
    console.log(';;');
    await next();
};

module.exports = {
    rateLimitPolicy,
    authentication,
    auth,
    admin,
    clearRateLimit
};

