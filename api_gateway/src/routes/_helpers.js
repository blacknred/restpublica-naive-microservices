/* eslint-disable consistent-return */
/* eslint-disable no-throw-literal */

const axios = require('axios');
const debug = require('debug')('gateway');
const { genToken } = require('../auth/local');
const redis = require('redis');
const bluebird = require('bluebird');

const client = redis.createClient(6379, 'redis-cache');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
// time-span to count the failed requests in sec
const WATCHING_TIMESPAN = 60 * 10;
// "freeze" period in sec
const BLOCKING_TIMESPAN = 60 * 5;
// limit of failed requests
const FAILS_LIMIT = 15;


const request = async (ctx, host, url, r = false, fallback) => {
    // Use timeouts
    // Requests may be redirects or compositions
    /* In case of some microservice is not answering:
    - Use Circuit breaker pattern – Track the number of successful
        and failed requests. If the error rate exceeds a configured
        threshold, trip the circuit breaker so that further attempts
        fail immediately. If a large number of requests are failing,
        that suggests the service is unavailable and that sending
        requests is pointless. After a timeout period, the client
        should try again and, if successful, close the circuit breaker.
    - Define a fallback action when a request fails - Perform fallback
        logic when a request fails. For example, return cached data or a
        default value such as empty set of recommendations.
        - redirects and first compositions calls have no fallbacks
        and return '500 service error'
        - non first compositions requests have fallbacks cause have
        some data to return */

    // compose key for identifying blocked hosts
    const blockedHost = `blocked_host_${host}`;
    // compose counter for failed requests
    const hostFailesCounter = `host_fails_counter_${host}`;
    // conf for request
    const conf = {
        url: host + url,
        method: ctx.state.method || ctx.method,
        headers: {
            'x-access-token': ctx.state.userAuthToken || genToken(ctx.state.consumer),
            'user-agent': ctx.headers['user-agent']
        },
        data: ctx.state.body || ctx.request.body,
        timeout: 2000,
        maxRedirects: 5,
        // ?proxy: {}
        validateStatus: status => status >= 200 && status < 500,
    };
    try {
        // if host is blocked run fallback or throw error
        const isBlocked = await client.getAsync(blockedHost);
        if (isBlocked) {
            if (fallback) fallback();
            else throw new Error();
        }
        // request
        const res = await axios.request(conf);
        // return data if return flag is true(composition)
        ctx.status = res.status;
        if (r) return res.data;
        // response if redirection
        ctx.body = res.data;
    } catch (e) {
        // detect if service is not available
        if (e.code === 'ECONNABORTED') {
            // get iterate service fails counter
            let cnt = await client.getAsync(hostFailesCounter);
            // or create
            if (!cnt) {
                client.set(hostFailesCounter, 1);
                client.expire(hostFailesCounter, WATCHING_TIMESPAN);
            }
            // increment host fails counter
            await client.incr(hostFailesCounter);
            // check limit
            if (++cnt > FAILS_LIMIT) {
                // mark the host as "blocked" and
                // expiring itself after the defined freeze period
                client.set(blockedHost, 1);
                client.expire(blockedHost, BLOCKING_TIMESPAN);
                // remove service fails counter
                client.del(hostFailesCounter);
                debug('Service on %s is blocked for %s sec', host, BLOCKING_TIMESPAN);
            }
            debug('Service on %s has not answered', host);
            // run fallback if there is
            if (fallback) return fallback();
        }
        ctx.throw(500, e.response.data.message);
    }
};


const timeout = async (ctx, next) => {
    const delay = 5000;
    // const status = options.status || 408;
    // const message = options.message || 'request time-out';
    // const callback = options.callback || function () {};
    let timer;
    const t = new Promise((_, reject) => {
        timer = setTimeout(() => {
            ctx.state.timeout = true;
            reject(ctx.throw(408, 'request time-out'));
            // callback(ctx, delay);
        }, delay);
    });
    await Promise.race([t, next()]);
    clearTimeout(timer);
};


module.exports = {
    request,
    timeout
};
