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
        const data = await request(ctx, hosts.USERS_API, ctx.url, true);
        // adds
        if (data.status === 'success') {
            // get preview posts
            const pUrl = `/posts?profiles=${data.data.map(user => user.id)}`;
            const posts = await request(ctx, hosts.POSTS_API, pUrl, true, () => ctx.body = data);
            data.data.users.forEach(x => x.posts = posts.data.find(y => y.author_id === x.id));
        }
        ctx.body = data;
    })
    .get('/users/:name', async (ctx) => {
        // get profile data
        const data = await request(ctx, hosts.USERS_API, ctx.url, true);
        // adds
        if (data.status === 'success') {
            // get communities subscriptions count
            data.communities_subscriptions_count = await request(ctx, hosts.COMMUNITIES_API,
                `/communities/count?profile=${data.data.id}`);
            // get posts count
            data.posts_count = await request(ctx, hosts.POSTS_API,
                `/posts/count?profile=${data.data.id}`);
        }
        ctx.body = data;
    })


    .get('/communities/:name', async (ctx) => {
        // get community data
        const data = await request(ctx, hosts.COMMUNITIES_API, ctx.url, true);
        // adds
        if (data.status === 'success') {
            // get community posts count

            // get admin data
            const pUrl = `/users?list=${data.data.author_id}`;
            const admin = await request(ctx, hosts.USERS_API, pUrl, true);
            data.data.admin = admin.data;
        }
        ctx.body = data;
    })
    .get('/communities/:cid/followers', auth, async (ctx) => {
        // get followers
        const data = await request(ctx, hosts.COMMUNITIES_API, ctx.url, true);
        // adds
        if (data.status === 'success') {
            // get profiles data
            const pUrl = `/users?list=${data.data.map(fol => fol.user_id)}`;
            const profiles = await request(ctx, hosts.USERS_API, pUrl, true);
            data.data.subscriptions
                .forEach(x => x.user = profiles.data.find(y => y.id === x.user_id));
        }
        ctx.body = data;
    })
    .get('/communities/:cid/bans', auth, async (ctx) => {
        // get banned profiles
        const data = await request(ctx, hosts.COMMUNITIES_API, ctx.url, true);
        // adds
        if (data.status === 'success') {
            // get profiles data
            const pUrl = `/users?list=${data.data.map(ban => ban.user_id)}`;
            const profiles = await request(ctx, hosts.USERS_API, pUrl, true);
            data.data.bans.forEach(x => x.user = profiles.data.find(y => y.id === x.user_id));
        }
        ctx.body = data;
    })


    .post('/posts', auth, async (ctx) => {
        // create post
        const data = await request(ctx, hosts.POSTS_API, ctx.url, true);
        // adds
        if (data.status === 'success') {
            // update last_post_at datetime
            ctx.state.method = 'PUT';
            ctx.state.body = {
                option: 'last_post_at',
                value: new Date()
            };
            Promise.all([
                await request(ctx, hosts.USERS_API, '/users', true),
                data.data.community_id === 0 ? null :
                    await request(ctx, hosts.COMMUNITIES_API, '/communities', true)
            ]);
        }
        ctx.body = data;
    })
    .get('/posts', async (ctx) => {
        // get posts data
        const data = await request(ctx, hosts.POSTS_API, ctx.url, true);
        // adds
        if (data.status === 'success') {
            // get authors data
            const pUrl = `/users?list=${data.data.map(post => post.author_id)}`;
            const profiles = await request(ctx, hosts.USERS_API, pUrl, true);
            // get communities names
            const cUrl = `/communities?list=${data.data.map(post => post.community_id)}&lim=name`;
            const communities = await request(ctx, hosts.USERS_API, cUrl, true);
            data.data.posts.forEach((x, i) => {
                x.author = profiles.data.find(y => y.id === x.user_id);
                x.communityName = communities.data[i].name;
            });
        }
        ctx.body = data;
    })
    .get('/posts/:slug', async (ctx) => {
        // get post data
        const data = await request(ctx, hosts.POSTS_API, ctx.url, true);
        // adds
        if (data.status === 'success') {
            // get author data
            const pUrl = `/users?list=${data.data.author_id}`;
            const user = await request(ctx, hosts.USERS_API, pUrl, true);
            data.data.author = user.data;
            // get community name
            const cUrl = `/communities?list=${data.data.author_id}%lim=name`;
            const community = await request(ctx, hosts.USERS_API, cUrl, true);
            data.data.communityName = community.data;
            // ? TODO: concurrently author, comments, likes
        }
        ctx.body = data;
    })
    .get('/posts/:pid/comments', async (ctx) => {
        // get post comments
        const data = await request(ctx, hosts.POSTS_API, ctx.url, true);
        // adds
        if (data.status === 'success') {
            // get profiles info
            const pUrl = `/users?list=${data.data.map(com => com.user_id)}`;
            const profiles = await request(ctx, hosts.USERS_API, pUrl, true);
            data.data.comments.forEach(x => x.author = profiles.data.find(y => y.id === x.user_id));
        }
        ctx.body = data;
    })
    .get('/posts/:pid/likes', auth, async (ctx) => {
        // get post likes
        const data = await request(ctx, hosts.POSTS_API, ctx.url, true);
        // adds
        if (data.status === 'success') {
            // get profiles info
            const pUrl = `/users?list=${data.data.map(like => like.user_id)}`;
            const profiles = await request(ctx, hosts.USERS_API, pUrl, true);
            data.data.likes.forEach(x => x.author = profiles.data.find(y => y.id === x.user_id));
        }
        ctx.body = data;
    })


    .get('/dashboard', auth, async (ctx) => {
        let data;
        // get following profiles ids -- last week max 100
        const profiles = await request(ctx, hosts.USERS_API, ctx.url, true);
        // get following communities ids -- last week max 100
        const communities = await request(ctx, hosts.COMMUNITIES_API,
            '/communities?mode=dashboard', ctx.url, true);

        // get posts ?limit=${ctx.request.queries.limit}

        // get pids posts '/posts?profiles=pids'
        // get cids posts '/posts?communities=cids
        // combine posts, remove duplicates and sort by date DESC
        // data.posts.forEach(x => x.author = users.find(y => y.user_id == x.user_id));

        /*
        <--authors, communities
        Select distinct id
        From Posts
        Where author_id in authors
        orWhere communities_id in communities
        SortBy users.last_post_at Desc
        Limit 20 Offset offset
        --> status {next_res_offset 1, next_posts_offset: 2 }, count{}, posts{}
        */

        ctx.body = data;
    });

module.exports = router;

