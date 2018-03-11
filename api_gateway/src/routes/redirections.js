const Router = require('koa-router');
const { authentication } = require('../auth');
const { request } = require('../services');

const router = new Router();

/* *** Redirections *** */
router
    .post('/users', ctx => request(ctx, ctx.users_host, ctx.url))
    .post('/users/login', ctx => request(ctx, ctx.users_host, ctx.url))
    .get('/users/user', authentication, ctx => request(ctx, ctx.users_host, ctx.url))
    .put('/users', authentication, ctx => request(ctx, ctx.users_host, ctx.url))

    .post('/users/:uid/follow', authentication, ctx => request(ctx, ctx.users_host, ctx.url))
    .get('/users/:uid/followers', authentication, ctx => request(ctx, ctx.users_host, ctx.url))
    .get('/users/:uid/following', authentication, ctx => request(ctx, ctx.users_host, ctx.url))
    .delete('/users/:uid/follow/:sid', authentication, ctx => request(ctx, ctx.users_host, ctx.url))


    .post('/communities', authentication, ctx => request(ctx, ctx.communities_host, ctx.url))
    .put('/communities/:cid', authentication, ctx => request(ctx, ctx.communities_host, ctx.url))
    .delete('/communities/:cid', authentication, ctx => request(ctx, ctx.communities_host, ctx.url))
    .post('/communities/:cid/follow', authentication, ctx => request(ctx, ctx.communities_host, ctx.url))
    .delete('/communities/:cid/follow/:sid', authentication, ctx => request(ctx, ctx.communities_host, ctx.url))
    .post('/communities/:cid/ban', authentication, ctx => request(ctx, ctx.communities_host, ctx.url))


    .post('/posts', authentication, ctx => request(ctx, ctx.posts_host, ctx.url))
    .put('/posts/:pid', authentication, ctx => request(ctx, ctx.posts_host, ctx.url))
    .delete('/posts/:pid', authentication, ctx => request(ctx, ctx.posts_host, ctx.url))
    .post('/posts/:pid/comments', authentication, ctx => request(ctx, ctx.posts_host, ctx.url))
    .get('/posts/:pid/comments', ctx => request(ctx, ctx.posts_host, ctx.url))
    .put('/posts/:pid/comment/:cid', authentication, ctx => request(ctx, ctx.posts_host, ctx.url))
    .delete('/posts/:pid/comment/:cid', authentication, ctx => request(ctx, ctx.posts_host, ctx.url))
    .post('/posts/:pid/likes', authentication, ctx => request(ctx, ctx.posts_host, ctx.url))
    .get('/posts/:pid/likes', authentication, ctx => request(ctx, ctx.posts_host, ctx.url))
    .delete('/posts/:pid/likes/:lid', authentication, ctx => request(ctx, ctx.posts_host, ctx.url))
    .get('/tags', authentication, ctx => request(ctx, ctx.posts_host, ctx.url));

module.exports = router;
