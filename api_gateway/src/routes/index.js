const Router = require('koa-router');
const { authentication } = require('../consumer_registry');
// const routeHelpers = require('./_helpers');

const router = new Router({ prefix: '/api/v1' });

/* Gateway proxies API requests from API endpoints to
microservices referenced in service endpoints. */

router.get('/ping', async (ctx) => {
    ctx.body = 'pong';
});

/* Users API */

router
    .post('/users', async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.users_api_host + ctx.path);
    })
    .put('/users', async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.users_api_host + ctx.path);
    })
    .delete('/users', async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.users_api_host + ctx.path);
    })
    .get('/users/user', authentication, async (ctx) => {
        ctx.status = 301;
        ctx.redirect(ctx.users_api_host + ctx.path);
    })
    .post('/users/login', async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.users_api_host + ctx.path);
    })
    .get('/users/:name', authentication, async (ctx) => {
        ctx.status = 301;
        ctx.redirect(ctx.users_api_host + ctx.path);
    })
    .get('/users/:name/id', authentication, async (ctx) => {
        ctx.status = 301;
        ctx.redirect(ctx.users_api_host + ctx.path);
    })
    .post('/users/:uid/follow', authentication, async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.users_api_host + ctx.path);
    })
    .delete('/users/:uid/follow/:sid', authentication, async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.users_api_host + ctx.path);
    })
    .get('/users/:uid/followers', authentication, async (ctx) => {
        ctx.status = 301;
        ctx.redirect(ctx.users_api_host + ctx.path);
    })
    .get('/users/:uid/following', authentication, async (ctx) => {
        ctx.status = 301;
        ctx.redirect(ctx.users_api_host + ctx.path);
    })
    .get('/users', authentication, async (ctx) => {
        ctx.status = 301;
        ctx.redirect(ctx.users_api_host + ctx.path);
    });

/* Communities API */

router
    .post('/communities', async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.communities_api_host + ctx.path);
    })
    .put('/communities/:cid', async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.communities_api_host + ctx.path);
    })
    .delete('/communities/:cid', async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.communities_api_host + ctx.path);
    })
    .get('/communities/:name', authentication, async (ctx) => {
        ctx.status = 301;
        ctx.redirect(ctx.communities_api_host + ctx.path);
    })
    .get('/communities/:name/id', authentication, async (ctx) => {
        ctx.status = 301;
        ctx.redirect(ctx.users_api_host + ctx.path);
    })
    .post('/communities/:cid/follow', authentication, async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.communities_api_host + ctx.path);
    })
    .delete('/communities/:cid/follow/:sid', authentication, async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.communities_api_host + ctx.path);
    })
    .get('/communities/:cid/followers', authentication, async (ctx) => {
        ctx.status = 301;
        ctx.redirect(ctx.communities_api_host + ctx.path);
    })
    .get('/communities', authentication, async (ctx) => {
        ctx.status = 301;
        ctx.redirect(ctx.communities_api_host + ctx.path);
    })
    .post('/communities/:cid/ban', authentication, async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.communities_api_host + ctx.path);
    })
    .get('/communities/:cid/bans', authentication, async (ctx) => {
        ctx.status = 301;
        ctx.redirect(ctx.communities_api_host + ctx.path);
    });

/* Posts API */

router
    .post('/posts', async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.posts_api_host + ctx.path);
    })
    .put('/posts/:pid', async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.posts_api_host + ctx.path);
    })
    .delete('/posts/:pid', async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.posts_api_host + ctx.path);
    })
    .get('/posts/:slug', authentication, async (ctx) => {
        ctx.status = 301;
        ctx.redirect(ctx.posts_api_host + ctx.path);
    })
    .post('/posts/:pid/comments', async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.posts_api_host + ctx.path);
    })
    .put('/posts/:pid/comment/:cid', async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.posts_api_host + ctx.path);
    })
    .delete('/posts/:pid/comment/:cid', async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.posts_api_host + ctx.path);
    })
    .get('/posts/:pid/comments', authentication, async (ctx) => {
        ctx.status = 301;
        ctx.redirect(ctx.posts_api_host + ctx.path);
    })
    .post('/posts/:pid/likes', async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.posts_api_host + ctx.path);
    })
    .delete('/posts/:pid/likes/:lid', async (ctx) => {
        ctx.status = 307;
        ctx.redirect(ctx.posts_api_host + ctx.path);
    })
    .get('/posts/:pid/likes', authentication, async (ctx) => {
        ctx.status = 301;
        ctx.redirect(ctx.posts_api_host + ctx.path);
    })
    .get('/posts', authentication, async (ctx) => {
        ctx.status = 301;
        ctx.redirect(ctx.posts_api_host + ctx.path);
    })
    .get('/tags', authentication, async (ctx) => {
        ctx.status = 301;
        ctx.redirect(ctx.posts_api_host + ctx.path);
    });


module.exports = router;
