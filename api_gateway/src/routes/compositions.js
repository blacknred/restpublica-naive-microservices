/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
const Router = require('koa-router');
const { users_api, communities_api, posts_api } = require('../adresses');
const { auth, clearRateLimit } = require('../auth');
const { request } = require('./_helpers');

const router = new Router();

/* *** Compositions *** */
router
    .get('/users', async (ctx) => {
        // get profiles data
        const sUsers = await request(ctx, users_api, ctx.url, true);
        ctx.body = sUsers;
        // console.log(sUsers);
        // get preview posts if req not from mobile
        // if (!ctx.userAgent.isMobile) {
        //     const ids = sUsers.users.map(u => u.user_id);
        //     const sPosts = await request(ctx, ctx.posts_host, `/posts?profiles=${ids}`,
        //         () => { ctx.body = sUsers; });
        //     sUsers.users.forEach(x => x.posts = sPosts.find(y => y.user_id === x.user_id));
        // }
    })
    .get('/users/:name', async (ctx) => {
        // get profile data
        const sUser = await request(ctx, users_api, ctx.url, true);
        ctx.body = sUser;
        // const usersUrl = ctx.users_api_host + ctx.url;
        // const communitiesUrl = `${ctx.communities_api_host}/communities/count?profile=`;
        // const postsUrl = `${posts_api}/posts/count?profile=`;
        // try {
        //     // get communities subscriptions count
        //     sUser.communities_count = await request(ctx, communitiesUrl + sUser.id);
        //     // get posts count
        //     sUser.posts_count = await request(ctx, postsUrl + sUser.id);
        //     ctx.body = sUser;
        // } catch (err) {
        //     ctx.throw(500, process.env.NODE_ENV === 'production' ? null : err.message);
        // }
        // get user data
        // const usersUrl = ctx.users_api_host + ctx.url;
        // const communitiesUrl = `${ctx.communities_api_host}
        // /communities/count?profile=${ctx.state.consumer}`;
        // const postsUrl = `${posts_api}
        // /posts/count?profile=${ctx.state.consumer}`;
        // try {
        //     const sUser = await request(ctx, usersUrl);
        //     // get communities subscriptions count
        //     sUser.communities_count = await request(ctx, communitiesUrl);
        //     // get posts count
        //     sUser.posts_count = await request(ctx, postsUrl);
        //     ctx.body = sUser;
        // } catch (err) {
        //     ctx.throw(500, process.env.NODE_ENV === 'production' ? null : err.message);
        // }
    })
    .put('/users/logout', clearRateLimit)

    // -------------------------------------------------------------------------------
    .get('/communities', async (ctx, next) => {
        // get communities data
        if (ctx.query.admin) auth(ctx, next);
        const sComms = await request(ctx, communities_api, ctx.url, true);
        ctx.body = sComms;
        // const communitiesUrl = ctx.communities_api_host + ctx.url;
        // const usersUrl = `${ctx.communities_api_host}
        // /communities/count?profile=${ctx.state.consumer}`;
        // const postsUrl = `${posts_api}
        // /posts/count?profile=${ctx.state.consumer}`;
        // try {
        //     const sCommunities = await request(ctx, communitiesUrl);
        //     // get admin data

        //     // get posts if req not from mobile
        //     if (ctx.userAgent.isMobile) {
        //         const ids = sUsers.users.map(u => u.user_id);
        //         const postsUrl = `${posts_api}/posts?communities=${ids}`;
        //         const sPosts = await request(postsUrl);
        //        sUsers.users.forEach(x => x.posts = sPosts.find(y => y.user_id === x.user_id));
        //     }
        //     ctx.body = sCommunities;
        // } catch (err) {
        //     ctx.throw(500, process.env.NODE_ENV === 'production' ? null : err.message);
        // }
        // const sPosts = await helpers.getUsersPosts(sUsers.users.map(u => u.user_id));
        // if (sUsers.count > 0 && !sPosts) throw new Error(`Users posts not fetched`);
        // // eslint-disable-next-line
        // sUsers.users.forEach(x => x.posts = sPosts.find(y => y.user_id == x.user_id));
    })
    .get('/communities/:name', async (ctx) => {
        const sComm = await request(ctx, communities_api, ctx.url, true);
        ctx.body = sComm;
        // get community data
        // get community posts count, ?community posts
    })
    .get('/communities/:cid/followers', auth, async (ctx) => {
        const sUsers = await request(ctx, communities_api, ctx.url, true);
        // get users info
        ctx.body = sUsers;
    })
    .get('/communities/:cid/bans', auth, async (ctx) => {
        const sUsers = await request(ctx, communities_api, ctx.url, true);
        // get users info
        ctx.body = sUsers;
    })

    // ------------------------------------------------------------------------------
    .get('/posts', async (ctx) => {
        ctx.status = 301;
        ctx.redirect(posts_api);
        // const sPosts = await helpers.getUsersPosts(sUsers.users.map(u => u.user_id));
        // if (sUsers.count > 0 && !sPosts) throw new Error(`Users posts not fetched`);
        // // eslint-disable-next-line
        // sUsers.users.forEach(x => x.posts = sPosts.find(y => y.user_id == x.user_id));
    })
    .get('/posts/:slug', async (ctx) => {
        ctx.status = 301;
        // ctx.redirect(posts_api + ctx.url);
    })

    // ----------------------------------------
    .get('/dashboard', auth, async (ctx) => {
        /*
        Select id
        From Users
        joinLeft users_subscriptions on user_subscriptions.user_id = users.id
        joinLeft comm_subscriptions on com_subscriptions.user_id = users.id
        Where users_subscriptions.sub_user.id = req.user
        orWhere
        ------------------------------------------------------------------
        1.
        Select id
        From Communities
        joinLeft comm_subscriptions on com_subscriptions.com_id = comms.id
        Where user_id = req.user
        SortBy comms.last_post_at Desc
        Limit 20 Offset offset
        --> authors: 23,45,12,22..
        2.
        Select id
        From Users
        joinLeft users_subscriptions on user_subscriptions.user_id = users.id
        Where users_subscriptions.sub_user.id = req.user
        SortBy users.last_post_at Desc
        Limit 20 Offset offset
        --> communities: 23,45,12,22..
        3.
        <--authors, communities
        Select distinct id
        From Posts
        Where author_id in authors
        orWhere communities_id in communities
        SortBy users.last_post_at Desc
        Limit 20 Offset offset
        --> status {next_res_offset 1, next_posts_offset: 2 }, count{}, posts{}
        */
        ctx.body = 'pong';
    });

module.exports = router;

//     /*
//     users ids from:
//     users where i follow and communities i follow
//     sort by 'last_post_at'
//     2 requests
//     */
//     /*
//     posts where user_id in UsersArr orWhere community_id in CommsArr
//     sort by created_at
//     */


//     // -> authors -> posts by authors
//     const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset)
//         ? --req.query.offset : 0;
//     return helpers.getFollowing(req)
//         .then((following) => {
//             if (!following) throw new Error(`User has no following users`);
//             return postsQueries.getDashboardPosts(
//                 following.map(sub => sub.user_id), offset
//             );
//         })
//         .then((data) => {
//             if (data.name) throw new Error(data.detail || data.message);
//             return Promise.all([
//                 data,
//                 helpers.getUsersData(data.posts.map(u => u.user_id))
//             ]);
//         })
//         .then((arrs) => {
//             const [data, users] = arrs;
//             if (data.count > 0 && !users) throw new Error(`Users data not fetched`);
//             // eslint-disable-next-line
//             data.posts.forEach(x => x.author = users.find(y => y.user_id == x.user_id));
//             res.status(200).json({
//                 status: 'success',
//                 data
//             });
//         })
//         .catch((err) => {
//             res.status(500).json({
//                 status: 'error',
//                 message: err.message
//             });
//         });
// });
