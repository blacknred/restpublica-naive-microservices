/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */

const Router = require('koa-router');
const hosts = require('../conf');
const { auth } = require('../auth');
const { request } = require('./_helpers');

const router = new Router();

/* Compose multiple backend services and aggregating the results */

router
    .get('/users', async (ctx) => {
        // get profiles data
        const sUsers = await request(ctx, hosts.USERS_API, ctx.url, true);
        // adds
        if (sUsers.status === 'success') {
            const ids = sUsers.data.data.map(user => user.id);
            // get preview posts
            const link = `/posts?profiles=${ids}&lim=${ctx.userAgent.isMobile ? 3 : 6}`;
            const sPosts =
                await request(ctx, hosts.POSTS_API, link, true, () => ctx.body = sUsers);
            sUsers.users.forEach(x => x.posts = sPosts.find(y => y.user_id === x.user_id));
        }
        ctx.body = sUsers;
    })
    .get('/users/:name', async (ctx) => {
        // get profile data
        const sUser = await request(ctx, hosts.USERS_API, ctx.url, true);
        // adds
        if (sUser.status === 'success') {
            const id = sUser.data.data.id;
            // get communities subscriptions count
            sUser.communities_subscriptions_count =
                await request(ctx, hosts.COMMUNITIES_API, `/communities/count?profile=${id}`);
            // get posts count
            sUser.posts_count =
                await request(ctx, hosts.POSTS_API, `/posts/count?profile=${id}`);
        }
        ctx.body = sUser;
    })


    .get('/communities/:name', async (ctx) => {
        // get community data
        const sComm = await request(ctx, hosts.COMMUNITIES_API, ctx.url, true);
        // adds
        if (sComm.status === 'success') {
            // get community posts count

            // get admin data
        }
        ctx.body = sComm;
    })
    .get('/communities/:cid/followers', auth, async (ctx) => {
        // get followers
        const sFollowers = await request(ctx, hosts.COMMUNITIES_API, ctx.url, true);
        // adds
        if (sFollowers.status === 'success') {
            // get profiles info

        }
        ctx.body = sFollowers;
    })
    .get('/communities/:cid/bans', auth, async (ctx) => {
        // get bunned profiles
        const sBunned = await request(ctx, hosts.COMMUNITIES_API, ctx.url, true);
        // adds
        if (sBunned.status === 'success') {
            // get profiles info

        }
        ctx.body = sBunned;
    })


    .post('/posts', auth, async (ctx) => {
        // create post
        const sPost = await request(ctx, hosts.POSTS_API, ctx.url, true);
        // adds
        if (sPost.status === 'success') {
            // update last_post_at datetime in user and community
            // concurrently

        }
        ctx.body = sPost;
    })
    .get('/posts', async (ctx) => {
        // get posts data
        const sPosts = await request(ctx, hosts.POSTS_API, ctx.url, true);
        // adds
        if (sPosts.status === 'success') {
            // get authors data
            // const sPosts = await helpers.getUsersPosts(sUsers.users.map(u => u.user_id));
            // sUsers.users.forEach(x => x.posts = sPosts.find(y => y.user_id == x.user_id));
        }
        ctx.body = sPosts;
    })
    .get('/posts/:slug', async (ctx) => {
        // get post data
        const sPost = await request(ctx, hosts.POSTS_API, ctx.url, true);
        // adds
        if (sPost.status === 'success') {
            // get author data

        }
        ctx.body = sPost;
    })
    .get('/posts/:pid/comments', async (ctx) => {
        // get post comments
        const sComments = await request(ctx, hosts.POSTS_API, ctx.url, true);
        // adds
        if (sComments.status === 'success') {
            // get profiles info

        }
        ctx.body = sComments;
    })
    .get('/posts/:pid/likes', auth, async (ctx) => {
        // get post likes
        const sLikes = await request(ctx, hosts.POSTS_API, ctx.url, true);
        // adds
        if (sLikes.status === 'success') {
            // get profiles info

        }
        ctx.body = sLikes;
    })


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
