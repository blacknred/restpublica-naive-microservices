const Router = require('koa-router');
const redirections = require('./redirections');
const compositions = require('./compositions');

const router = new Router({ prefix: 'v1' });

/* check */
router.get('/ping', (ctx) => { ctx.body = 'pong'; });

/* routers */
router.use(redirections.routes());
router.use(compositions.routes());

module.exports = router;

