/* eslint-disable no-return-assign */
const { request } = require('../routes/_helpers');
const hosts = require('../adresses');
const { genApiSecret } = require('./local');
const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const client = redis.createClient(6379, 'redis-cache');

/*
If there are auth headers in request, check them:
- app: check if api_secret is valid; ctx.state.consumer = 0
- user: get user id from users-api; ctx.state.consumer = user_id
*/
const authentication = async (ctx, next) => {
    if (process.env.NODE_ENV === 'test') {
        ctx.state.consumer = 1;
        await next();
    }
    const apiKey = ctx.headers.api_key || null;
    const apiSecret = ctx.headers.api_secret || null;
    if (apiKey && apiSecret) {
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
        const res = await request(ctx, hosts.users_api, '/users/check', true);
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
    const res = await request(ctx, hosts.users_api, '/users/check/admin', true);
    if (!res.admin) ctx.throw(401, 'Access is restricted');
    delete ctx.state.method;
    await next();
};

/* Clear Rate Limit on user logout */
const clearRateLimit = async (ctx, next) => {
    // delete related ip counter and ip limit
    const ipCounter = `ip_requests_counter_${ctx.ip}`;
    const ipLimit = `ip_requests_limit_${ctx.ip}`;
    client.del(ipCounter, ipLimit);
    await next();
};

/*
RateLimitPolicy.
Every consumer has limitation on count of requests by time to prevent Denial of
Service (DoS) attacks and memory exhaustation. Additionally partner apps (which
need much more traffic) might have higher limits based on  API plan.

The concept: There are ip counters and blockers in Redis with EXPIRE
functionality that allows avoid having to handle all the timing stuff. We will count
the requests of individual consumer over a defined time-span and will set the counter
to zero after the time-span is over. If consumer logout or changed API plan -
remove ip counter & ip limit.

Order:
- At first check if there is a "blocked" consumer ip
- At second, handle ip(check/get ipCounter, ipLimit)
    - If ip has partner app credentials, check if such partner ip is set already,
    otherwise check ip from partners-api and set partnerIp, ipCounter, iplimit
    - If ip is not partner, check if ipCounter was set already, otherwise
    set up ipCounter, ipLimit. If previous request from this ip was with app
    credentials,  delete partnerIp, ipCounter, iplimit at first.
- At third,  handle rate/limit
    - Increment ipCounter and if it will top limit of requests within the time-span,
    block any subsequent requests from this ip.  Accept requests again after a freeze period.
- Finally set not auth success flag: ctx.state.consumer = 0
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
    const partnerIp = `partner_ip_${ctx.ip}`;
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

    // set success non authorised request flag
    ctx.state.consumer = 0;

    // process ip
    const apiKey = ctx.headers.api_key || null;
    const apiSecret = ctx.headers.api_secret || null;
    if (apiKey && apiSecret) {
        // check ip as partner app
        const isPartnerIp = await client.getAsync(partnerIp);
        if (!isPartnerIp) {
            // check api_key and domain in partners service
            try {
                ctx.state.method = 'POST';
                ctx.state.body = {
                    api_key: apiKey,
                    domain: ctx.request.origin
                };
                const res = await request(ctx, hosts.partners_api, '/apps/check', true);
                if (typeof res.data.limit !== 'number') throw new Error();
                // set partnerIp, ipCounter, iplimit
                client.set(partnerIp, 1);
                client.set(ipLimit, parseInt(res.data.limit, 10));
                client.set(ipCounter, 1);
                client.expire(ipCounter, watchingTimespan);
            } catch (err) {
                ctx.throw(401, 'Invalid API key');
            }
            await next();
        }
    } else {
        // check ip as partner app (if previous request was from partner app)
        const isPartnerIp = await client.getAsync(partnerIp);
        if (isPartnerIp) {
            // clear partnerIp, ipCounter, ipLimit
            client.del(partnerIp);
            clearRateLimit(ctx, next);
        }
        // check ip as user
        const cnt = await client.getAsync(ipCounter);
        if (!cnt) {
            // set ipCounter, ipLimit
            client.set(ipCounter, 1);
            client.expire(ipCounter, watchingTimespan);
            await next();
        }
    }

    // process rate/limit
    try {
        let cnt = await client.getAsync(ipCounter);
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
        await next();
    } catch (err) {
        ctx.throw(429, err.message);
    }
};

module.exports = {
    rateLimitPolicy,
    authentication,
    auth,
    admin,
    clearRateLimit
};

