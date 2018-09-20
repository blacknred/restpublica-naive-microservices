const axios = require('axios');
const Router = require('koa-router');

const redirections = require('./redirections');
const compositions = require('./compositions');

const router = new Router(); // { prefix: 'v1' }

router
    /* check */
    .get('/ping', (ctx) => { ctx.body = 'pong'; })

    /* parse resource */
    .get('/proxy', ctx => axios.get(ctx.query.url)
        .then((res) => { ctx.body = res.data; })
        .catch(err => err.message));

/* routers */
router.use(redirections.routes());
router.use(compositions.routes());

module.exports = router;

