/* eslint-disable no-return-assign */

const Router = require('koa-router');
const hosts = require('../conf');
const { request } = require('./_helpers');
const { auth, admin, clearRateLimit } = require('../auth');

const router = new Router();

/* Redirect to the appropriate backend service */

router
    .post('/users', ctx => request(ctx, hosts.USERS_API, ctx.url))
    .post('/users/login', ctx => request(ctx, hosts.USERS_API, ctx.url))
    .get('/users/profile', auth, ctx => request(ctx, hosts.USERS_API, ctx.url))
    .put('/users', auth, ctx => request(ctx, hosts.USERS_API, ctx.url))
    .post('/users/:uid/follow', auth, ctx => request(ctx, hosts.USERS_API, ctx.url))
    .get('/users/:uid/followers', auth, ctx => request(ctx, hosts.USERS_API, ctx.url))
    .get('/users/:uid/following', auth, ctx => request(ctx, hosts.USERS_API, ctx.url))
    .delete('/users/:uid/follow/:sid', auth, ctx => request(ctx, hosts.USERS_API, ctx.url))
    .put('/users/logout', clearRateLimit, ctx => ctx.body = { status: 'success' })

    .post('/communities', auth, ctx => request(ctx, hosts.COMMUNITIES_API, ctx.url))
    .get('/communities', ctx => request(ctx, hosts.COMMUNITIES_API, ctx.url))
    .put('/communities/:cid', auth, ctx => request(ctx, hosts.COMMUNITIES_API, ctx.url))
    .post('/communities/:cid/follow', auth, ctx => request(ctx, hosts.COMMUNITIES_API, ctx.url))
    .delete('/communities/:cid/follow/:sid', auth, ctx => request(ctx, hosts.COMMUNITIES_API, ctx.url))
    .post('/communities/:cid/ban', auth, ctx => request(ctx, hosts.COMMUNITIES_API, ctx.url))

    .put('/posts/:pid', auth, ctx => request(ctx, hosts.POSTS_API, ctx.url))
    .delete('/posts/:pid', auth, ctx => request(ctx, hosts.POSTS_API, ctx.url))
    .post('/posts/:pid/comments', auth, ctx => request(ctx, hosts.POSTS_API, ctx.url))
    .put('/posts/:pid/comments/:cid', auth, ctx => request(ctx, hosts.POSTS_API, ctx.url))
    .delete('/posts/:pid/comments/:cid', auth, ctx => request(ctx, hosts.POSTS_API, ctx.url))
    .post('/posts/:pid/likes', auth, ctx => request(ctx, hosts.POSTS_API, ctx.url))
    .delete('/posts/:pid/likes', auth, ctx => request(ctx, hosts.POSTS_API, ctx.url))
    .get('/tags', ctx => request(ctx, hosts.POSTS_API, ctx.url))

    .post('/plans', auth, admin, ctx => request(ctx, hosts.PARTNERS_API, ctx.url))
    .get('/plans', auth, admin, ctx => request(ctx, hosts.PARTNERS_API, ctx.url))
    .get('/plans/:name', auth, admin, ctx => request(ctx, hosts.PARTNERS_API, ctx.url))
    .put('/plans/:name', auth, admin, ctx => request(ctx, hosts.PARTNERS_API, ctx.url))
    .delete('/plans/:name', auth, admin, ctx => request(ctx, hosts.PARTNERS_API, ctx.url))
    .post('/apps', auth, ctx => request(ctx, hosts.PARTNERS_API, ctx.url))
    .post('/apps/check', auth, ctx => request(ctx, hosts.PARTNERS_API, ctx.url))
    .get('/apps', auth, admin, ctx => request(ctx, hosts.PARTNERS_API, ctx.url))
    .get('/apps/:pid', auth, ctx => request(ctx, hosts.PARTNERS_API, ctx.url))
    .put('/apps/:pid', auth, ctx => request(ctx, hosts.PARTNERS_API, ctx.url))
    .delete('/apps/:pid', auth, ctx => request(ctx, hosts.PARTNERS_API, ctx.url));

module.exports = router;
