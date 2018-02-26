const axios = require('axios');
const redis = require('redis');
const bluebird = require('bluebird');
const { encodeToken } = require('../consumer_registry/local');

const client = redis.createClient(6379, 'redis-cache');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

/*
Circuit breaker
request||fallback
?proxy
*/

module.exports = async function request(ctx, host, url, fallback) {
    // "freeze" period in sec
    const blockingTimespan = 600;
    // limit of failed requests
    const failsLimit = 5;
    // compose key for identifying blocked hosts
    const blockedHost = `blocked_host_${host}`;
    // compose counter for failed requests
    const hostFailesCounter = `host_fails_counter_${host}`;
    const conf = {
        url: host + url,
        method: ctx.method,
        headers: { Authorization: `Bearer ${encodeToken(ctx.state.consumer)}` },
        data: ctx.request.body,
        timeout: 100,
        maxContentLength: 2000,
        maxRedirects: 5,
        validateStatus: status => status >= 200 && status < 500,
        // proxy: {
        //     host: '127.0.0.1',
        //     port: 9000,
        //     auth: {
        //         username: 'mikeymike',
        //         password: 'rapunz3l'
        //     }
        // }
    };
    try {
        // check if host is not blocked
        const isBlocked = await client.getAsync(blockedHost);
        if (isBlocked) {
            // fallback
            if (fallback) fallback();
            else ctx.body = {};
        } else {
            // make request
            const data = await axios.request(conf);
            // return data if composition request or
            // response if redirection request
            if (fallback) return data.data;
            ctx.status = data.status;
            ctx.body = data.data;
        }
    } catch (e) {
        // detect if service is not available
        if (e.code === 'ECONNABORTED') {
            // iterate service fails counter
            let cnt = await client.getAsync(hostFailesCounter);
            if (!cnt) client.set(hostFailesCounter, 1);
            // increment host fails counter
            await client.incr(hostFailesCounter);
            // check limit
            if (++cnt > failsLimit) {
                // mark the host as "blocked" and
                // expiring itself after the defined freeze period
                client.set(blockedHost, 1);
                client.expire(blockedHost, blockingTimespan);
                // remove service fails counter
                client.del(hostFailesCounter);
                // fallback
                if (fallback) fallback();
                else ctx.body = null;
            }
        } else {
            // handle something with code 500
            ctx.throw(500, e.response.data);
        }
    }
    return null;
};

