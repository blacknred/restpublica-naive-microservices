const Router = require('koa-router');
const redirections = require('./redirections');
const compositions = require('./compositions');

const router = new Router({ prefix: '/api/v1' });

/*
Router:
- Filter client type and use related endpoints
- Redirect them to the appropriate backend service(?redirect)
- Compose multiple backend services and aggregating the results
- Implement independent requests concurrently
*/

/* check */
router.get('/ping', (ctx) => { ctx.body = 'pong'; });

/* compose routes */
router.use(compositions.routes());
router.use(redirections.routes());

module.exports = router;

