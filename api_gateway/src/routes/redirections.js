/* eslint-disable no-return-assign */

const Router = require('koa-router');
const hosts = require('../conf');
const { request } = require('./_helpers');
const { auth, admin } = require('../auth');

const router = new Router();

/* Redirect to the appropriate backend service */

router
    .post('/users', ctx => request({ ctx, host: hosts.USERS_API }))
    .post('/users/login', ctx => request({ ctx, host: hosts.USERS_API }))
    .get('/users/profile', auth, ctx => request({ ctx, host: hosts.USERS_API }))
    .get('/users', ctx => request({ ctx, host: hosts.USERS_API }))
    .put('/users', auth, ctx => request({ ctx, host: hosts.USERS_API }))
    .post('/users/:uid/follow', auth, ctx => request({ ctx, host: hosts.USERS_API }))
    .get('/users/:uid/followers', auth, ctx => request({ ctx, host: hosts.USERS_API }))
    .get('/users/:uid/followin', auth, ctx => request({ ctx, host: hosts.USERS_API }))
    .delete('/users/:uid/follow/:sid', auth, ctx => request({ ctx, host: hosts.USERS_API }))

    .post('/communities', auth, ctx => request({ ctx, host: hosts.COMMUNITIES_API }))
    .get('/communities', ctx => request({ ctx, host: hosts.COMMUNITIES_API }))
    .put('/communities/:cid', auth, ctx => request({ ctx, host: hosts.COMMUNITIES_API }))
    .post('/communities/:cid/follow', auth, ctx => request({ ctx, host: hosts.COMMUNITIES_API }))
    .delete('/communities/:cid/follow/:sid', auth,
        ctx => request({ ctx, host: hosts.COMMUNITIES_API }))
    .post('/communities/:cid/ban', auth, ctx => request({ ctx, host: hosts.COMMUNITIES_API }))

    .put('/posts/:pid', auth, ctx => request({ ctx, host: hosts.POSTS_API }))
    .delete('/posts/:pid', auth, ctx => request({ ctx, host: hosts.POSTS_API }))
    .post('/posts/:pid/comments', auth, ctx => request({ ctx, host: hosts.POSTS_API }))
    .put('/posts/:pid/comments/:cid', auth, ctx => request({ ctx, host: hosts.POSTS_API }))
    .delete('/posts/:pid/comments/:cid', auth, ctx => request({ ctx, host: hosts.POSTS_API }))
    .post('/posts/:pid/likes', auth, ctx => request({ ctx, host: hosts.POSTS_API }))
    .delete('/posts/:pid/likes', auth, ctx => request({ ctx, host: hosts.POSTS_API }))
    .post('/posts/:pid/votes', auth, ctx => request({ ctx, host: hosts.POSTS_API }))
    .delete('/posts/:pid/votes/:oid', auth, ctx => request({ ctx, host: hosts.POSTS_API }))
    .get('/tags', ctx => request({ ctx, host: hosts.POSTS_API }))

    .post('/plans', auth, admin, ctx => request({ ctx, host: hosts.PARTNERS_API }))
    .get('/plans', auth, admin, ctx => request({ ctx, host: hosts.PARTNERS_API }))
    .get('/plans/:name', auth, admin, ctx => request({ ctx, host: hosts.PARTNERS_API }))
    .put('/plans/:name', auth, admin, ctx => request({ ctx, host: hosts.PARTNERS_API }))
    .delete('/plans/:name', auth, admin, ctx => request({ ctx, host: hosts.PARTNERS_API }))
    .post('/apps', auth, ctx => request({ ctx, host: hosts.PARTNERS_API }))
    .post('/apps/check', auth, ctx => request({ ctx, host: hosts.PARTNERS_API }))
    .get('/apps', auth, admin, ctx => request({ ctx, host: hosts.PARTNERS_API }))
    .get('/apps/:pid', auth, ctx => request({ ctx, host: hosts.PARTNERS_API }))
    .put('/apps/:pid', auth, ctx => request({ ctx, host: hosts.PARTNERS_API }))
    .delete('/apps/:pid', auth, ctx => request({ ctx, host: hosts.PARTNERS_API }));

module.exports = router;
