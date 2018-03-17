const Router = require('koa-router');
const hosts = require('../adresses');
const { auth, admin } = require('../auth');
const { request } = require('./_helpers');

const router = new Router();

/* *** Redirections *** */
router
    .post('/users', ctx => request(ctx, hosts.users_api, ctx.url))
    .post('/users/login', ctx => request(ctx, hosts.users_api, ctx.url))
    .get('/users/user', auth, ctx => request(ctx, hosts.users_api, ctx.url))
    .put('/users', auth, ctx => request(ctx, hosts.users_api, ctx.url))
    .post('/users/:uid/follow', auth, ctx => request(ctx, hosts.users_api, ctx.url))
    .get('/users/:uid/followers', auth, ctx => request(ctx, hosts.users_api, ctx.url))
    .get('/users/:uid/following', auth, ctx => request(ctx, hosts.users_api, ctx.url))
    .delete('/users/:uid/follow/:sid', auth, ctx => request(ctx, hosts.users_api, ctx.url))

    .post('/communities', auth, ctx => request(ctx, hosts.communities_api, ctx.url))
    .put('/communities/:cid', auth, ctx => request(ctx, hosts.communities_api, ctx.url))
    .post('/communities/:cid/follow', auth, ctx => request(ctx, hosts.communities_api, ctx.url))
    .delete('/communities/:cid/follow/:sid', auth, ctx => request(ctx, hosts.communities_api, ctx.url))
    .post('/communities/:cid/ban', auth, ctx => request(ctx, hosts.communities_api, ctx.url))

    .post('/posts', auth, ctx => request(ctx, hosts.posts_api, ctx.url))
    .put('/posts/:pid', auth, ctx => request(ctx, hosts.posts_api, ctx.url))
    .delete('/posts/:pid', auth, ctx => request(ctx, hosts.posts_api, ctx.url))
    .post('/posts/:pid/comments', auth, ctx => request(ctx, hosts.posts_api, ctx.url))
    .get('/posts/:pid/comments', ctx => request(ctx, hosts.posts_api, ctx.url))
    .put('/posts/:pid/comment/:cid', auth, ctx => request(ctx, hosts.posts_api, ctx.url))
    .delete('/posts/:pid/comment/:cid', auth, ctx => request(ctx, hosts.posts_api, ctx.url))
    .post('/posts/:pid/likes', auth, ctx => request(ctx, hosts.posts_api, ctx.url))
    .get('/posts/:pid/likes', auth, ctx => request(ctx, hosts.posts_api, ctx.url))
    .delete('/posts/:pid/likes/:lid', auth, ctx => request(ctx, hosts.posts_api, ctx.url))
    .get('/tags', auth, ctx => request(ctx, hosts.posts_api, ctx.url))

    .post('/plans', auth, admin, ctx => request(ctx, hosts.partners_api, ctx.url))
    .get('/plans', auth, admin, ctx => request(ctx, hosts.partners_api, ctx.url))
    .get('/plans/:name', auth, admin, ctx => request(ctx, hosts.partners_api, ctx.url))
    .put('/plans/:name', auth, admin, ctx => request(ctx, hosts.partners_api, ctx.url))
    .delete('/plans/:name', auth, admin, ctx => request(ctx, hosts.partners_api, ctx.url))
    .post('/apps', auth, ctx => request(ctx, hosts.partners_api, ctx.url))
    .post('/apps/check', auth, ctx => request(ctx, hosts.partners_api, ctx.url))
    .get('/apps', auth, admin, ctx => request(ctx, hosts.partners_api, ctx.url))
    .get('/apps/:pid', auth, ctx => request(ctx, hosts.partners_api, ctx.url))
    .put('/apps/:pid', auth, ctx => request(ctx, hosts.partners_api, ctx.url))
    .delete('/apps/:pid', auth, ctx => request(ctx, hosts.partners_api, ctx.url));

module.exports = router;
