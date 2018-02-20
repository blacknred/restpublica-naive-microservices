const request = require('request-promise');
const redis = require('redis');
const { encodeToken, genApiSecret } = require('./local');

const client = redis.createClient(6379, 'redis-cache');

/* Here we register consumers requests: users or apps.

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
    If ctx.state.consumer !== null generate a short-lived token
    for related microservices access
*/

const rateLimitPolicy = async (ctx, next) => {
    // "freeze" period in seconds
    const blockingTimespan = 300;
    // time-span to count the requests(1 hour)
    const watchingTimespan = 60 * 60;
    // compose key for identifying blocked ips
    const blockedIpKey = `ban_${ctx.ip}`;
    // compose key for counting requests
    const ipKey = `cnt_${ctx.ip}`;
    // compose key for identifying limit of requests(consumer-app)
    const reqLimitIpKey = `lim_${ctx.ip}`;

    try {
        // check if there is a "blocked" ip
        if (client.get(blockedIpKey)) {
            throw new Error('Api requests limit is reached.'
                + 'Try later or change Api plan.');
        }
        // check if the ip already has a counter
        if (client.get(ipKey)) {
            // main action: increment counter
            const numberOfRequests = client.incr(ipKey);
            // get requests limit for ip (based on existing of reqLimitIpKey or default val)
            let allowedRequests = client.get(reqLimitIpKey);
            if (!allowedRequests) allowedRequests = 50;
            // check limit
            if (numberOfRequests > allowedRequests) {
                // mark the consumer ip as "blocked"
                client.set(blockedIpKey, 1);
                // make the blocking expiring itself after the defined freeze period
                client.expire(blockedIpKey, blockingTimespan);
                throw new Error('Api requests limit is reached.'
                    + 'Try later or change Api plan.');
            }
        } else {
            // no key for counting exists yet - so set a new one with ttl
            const apiKey = ctx.headers.api_key;
            const apiSecret = ctx.headers.api_secret;
            if (typeof apiKey !== 'undefined' && typeof apiSecret !== 'undefined') {
                // handle partner api request: check api_key and domain matching in db
                const options = {
                    method: 'POST',
                    uri: `${ctx.partner_api_host}/api/v1/check`,
                    body: {
                        api_key: apiKey,
                        domain: ctx.request.origin
                    }
                };
                const res = await request(options);
                if (res.status !== 'ok') throw new Error('Invalid API request');
                // set requests limit
                client.set(reqLimitIpKey, res.data.limit_per_hour);
            }
            client.set(ipKey, 1);
            client.expire(ipKey, watchingTimespan);
        }
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
    // check api_key and api_secret
    const apiKey = ctx.headers.api_key;
    const apiSecret = ctx.headers.api_secret;
    if (typeof apiKey !== 'undefined' && typeof apiSecret !== 'undefined') {
        /* partner api request */
        try {
            // check api_secret
            if (apiSecret !== genApiSecret(apiKey)) {
                throw new Error('Invalid API request');
            }
            ctx.state.user = null;
        } catch (err) {
            ctx.state.consumer = null;
            console.log(err.message);
            ctx.throw(401, err.message);
        }
    } else {
        /* common user request with jwt token */
        try {
            const authHeader = ctx.headers.authentication;
            if (typeof authHeader === 'undefined') throw new Error();
            const options = {
                method: 'GET',
                uri: `${ctx.users_api_host}/api/v1/users/check`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authHeader.split(' ')[1]}`,
                },
            };
            const user = await request(options);
            console.log(user);
            ctx.state.consumer = user.id;
        } catch (err) {
            ctx.state.consumer = null;
            console.log(err.message);
            ctx.throw(401, 'Please log in');
        }
    }
    await next();
};

const createToken = async (ctx, next) => {
    await next();
    // create short-lived token and set auth header
    if (ctx.state.consumer === null) return;
    const token = await encodeToken(ctx.state.user);
    ctx.set('Authorization', `Bearer ${token}`);
    console.log('token created');
};

module.exports = {
    rateLimitPolicy,
    authentication,
    createToken
};

