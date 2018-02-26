const Router = require('koa-router');
const redirections = require('./redirections');
const compositions = require('./compositions');

const router = new Router({ prefix: '/api/v1' });

/*
API Gateway router should:
- TODO: Proxy all requests to the microservices
- Route requests:
    - filter client type and use related endpoints
    - by simply routing them to the appropriate backend service(?redirect)
    - by composition multiple backend services and aggregating the results
        - implement independent requests concurrently
        - Use timeouts in promises
- In case of some service is not answering:
    - Use Circuit breaker pattern – Track the number of successful
        and failed requests. If the error rate exceeds a configured
        threshold, trip the circuit breaker so that further attempts
        fail immediately. If a large number of requests are failing,
        that suggests the service is unavailable and that sending
        requests is pointless. After a timeout period, the client
        should try again and, if successful, close the circuit breaker.
    - define a fallback action when a request fails - Perform fallback
        logic when a request fails. For example, return cached data or a
        default value such as empty set of recommendations.
*/

/* check */
router.get('/ping', (ctx) => { ctx.body = 'pong'; });

/* compose routes */
router.use(compositions.routes());
router.use(redirections.routes());

module.exports = router;

