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
        const profiles = await request(ctx, hosts.USERS_API, ctx.url, true);
        const response = () => ctx.body = profiles;
        // adds
        if (profiles.status === 'success') {
            // get preview posts
            const requests = profiles.data.profiles.map(user => request(ctx, hosts.POSTS_API,
                `/posts?profile=${user.id}&reduced=true`, true, response));
            let rawPosts = await Promise.all(requests);
            rawPosts = rawPosts.map(p => p.data.posts);
            const posts = [].concat(...rawPosts);
            profiles.data.profiles.forEach(x => x.posts = posts.filter(y => y.author_id === x.id));
        }
        response();
    })
    .get('/users/:name', async (ctx) => {
        // get profile data
        const profile = await request(ctx, hosts.USERS_API, ctx.url, true);
        const response = () => ctx.body = profile;
        // adds
        if (profile.status === 'success') {
            // get communities subscriptions count
            const cUrl = `/communities?profile=${profile.data.id}&mode=count`;
            // get posts count
            const pUrl = `/posts?profile=${profile.data.id}&mode=count`;
            const [pCnt, cCnt] = await Promise.all([
                request(ctx, hosts.POSTS_API, pUrl, true, response),
                request(ctx, hosts.COMMUNITIES_API, cUrl, true, response),
            ]);
            profile.data.posts_cnt = pCnt.data.count;
            profile.data.communities_cnt = cCnt.data.count;
        }
        response();
    })

    .get('/communities/:name', async (ctx) => {
        // get community data
        const community = await request(ctx, hosts.COMMUNITIES_API, ctx.url, true);
        const response = () => ctx.body = community;
        // adds
        if (community.status === 'success') {
            // get posts count
            const pUrl = `/posts?community=${community.data.id}&mode=count`;
            // get admin data
            const uUrl = `/users?list=${community.data.admin_id}`;
            const [pCnt, admin] = await Promise.all([
                request(ctx, hosts.POSTS_API, pUrl, true, response),
                request(ctx, hosts.USERS_API, uUrl, true, response),
            ]);
            community.data.posts_cnt = pCnt.data.count;
            community.data.admin = admin.data.profiles[0];
        }
        response();
    })
    .get('/communities/:cid/followers', auth, async (ctx) => {
        // get followers
        const followers = await request(ctx, hosts.COMMUNITIES_API, ctx.url, true);
        const response = () => ctx.body = followers;
        // adds
        if (followers.status === 'success') {
            // get profiles data
            const pUrl = `/users?list=${followers.data.subscriptions.map(fol => fol.user_id)}`;
            const profiles = await request(ctx, hosts.USERS_API, pUrl, true);
            followers.data.subscriptions.forEach(x => x.user = profiles.data.profiles
                .find(y => y.id === x.user_id));
        }
        response();
    })
    .get('/communities/:cid/bans', auth, async (ctx) => {
        // get banned profiles
        const bans = await request(ctx, hosts.COMMUNITIES_API, ctx.url, true);
        const response = () => ctx.body = bans;
        // adds
        if (bans.status === 'success') {
            // get profiles data
            const pUrl = `/users?list=${bans.data.bans.map(ban => ban.user_id)}`;
            const profiles = await request(ctx, hosts.USERS_API, pUrl, true);
            bans.data.bans.forEach(x => x.user = profiles.data.profiles
                .find(y => y.id === x.user_id));
        }
        response();
    })

    .post('/posts', auth, async (ctx) => {
        // create post
        const post = await request(ctx, hosts.POSTS_API, ctx.url, true);
        const response = () => ctx.body = post;
        // adds
        if (post.status === 'success') {
            // update last_post_at datetime
            ctx.state.method = 'PUT';
            ctx.state.body = {
                option: 'last_post_at',
                value: new Date()
            };
            await Promise.all([
                request(ctx, hosts.USERS_API, '/users', true, response),
                post.data.community_id ? request(ctx, hosts.COMMUNITIES_API,
                    `/communities/${post.data.community_id}`, true, response) : null
            ]);
        }
        response();
    })
    .get('/posts', async (ctx) => {
        // get posts data
        const posts = await request(ctx, hosts.POSTS_API, ctx.url, true);
        const response = () => ctx.body = posts;
        // adds
        if (posts.status === 'success') {
            // get authors data
            const profileIds = [...new Set(posts.data.posts.map(post => post.author_id))];
            const pUrl = `/users?list=${profileIds}`;
            // get communities names
            const communityIds = [...new Set(posts.data.posts.map(p => p.community_id))];
            const cUrl = `/communities?list=${communityIds.filter(p => p > 0)}&lim=name`;
            const [authors, communities] = await Promise.all([
                request(ctx, hosts.USERS_API, pUrl, true, response),
                request(ctx, hosts.COMMUNITIES_API, cUrl, true, response)
            ]);
            posts.data.posts.forEach(x => x.author = authors.data.profiles
                .find(y => y.id === x.author_id));
            posts.data.posts.forEach((x) => {
                x.communityName = communities.data.communities
                    .find(y => y.id === x.community_id);
                if (x.communityName) x.communityName = x.communityName.name;
            });
        }
        response();
    })
    .get('/posts/:slug', async (ctx) => {
        // get post data
        const post = await request(ctx, hosts.POSTS_API, ctx.url, true);
        const response = () => ctx.body = post;
        // adds
        if (post.status === 'success') {
            // get author data
            const pUrl = `/users?list=${post.data.author_id}`;
            // get community name
            const cUrl = `/communities?list=${post.data.community_id}&lim=name`;
            const [author, community] = await Promise.all([
                request(ctx, hosts.USERS_API, pUrl, true, response),
                !post.data.community_id ? null :
                    request(ctx, hosts.COMMUNITIES_API, cUrl, true, response)
            ]);
            post.data.author = author.data.profiles[0];
            if (community) post.data.communityName = community.data.communities[0].name;
        }
        response();
    })
    .get('/posts/:pid/comments', async (ctx) => {
        // get post comments
        const comments = await request(ctx, hosts.POSTS_API, ctx.url, true);
        const userIds = [...new Set(comments.data.comments.map(com => com.user_id))];
        const profiles = await request(ctx, hosts.USERS_API, `/users?list=${userIds}`, true);
        comments.data.comments = comments.data.comments.map(x => profiles.data.profiles
            .find(y => y.id === x.user_id));
        ctx.body = comments;
    })
    .get('/posts/:pid/likes', auth, async (ctx) => {
        // get post likes
        const likes = await request(ctx, hosts.POSTS_API, ctx.url, true);
        const userIds = [...new Set(likes.data.likes.map(like => like.user_id))];
        const profiles = await request(ctx, hosts.USERS_API, `/users?list=${userIds}`, true);
        likes.data.likes = likes.data.likes.map(x => profiles.data.profiles
            .find(y => y.id === x.user_id));
        ctx.body = likes;
    })

    .get('/dashboard', auth, async (ctx) => {
        // get following profiles & communities ids -- last week & max 100
        const [rawProfiles, rawCommunities] = await Promise.all([
            request(ctx, hosts.USERS_API, `/users/${ctx.state.consumer}/dashboard`, true),
            request(ctx, hosts.COMMUNITIES_API, '/communities?dashboard=true', true)
        ]);
        const profiles = rawProfiles.data.map(p => p.user_id);
        const communities = rawCommunities.data.communities.map(c => c.id);
        console.log(profiles, communities);
        // get posts
        const pUrl = `/posts?dashboard=true&profiles=${profiles}&communities=${communities}`;
        const data = await request(ctx, hosts.POSTS_API, pUrl, true);
        ctx.body = data;
        // const pIds = profiles.data.map(prof => `${prof.id},`);
        // const cIds = communities.data.map(comm => `${comm.id},`);
        // const pUrl = `/posts?profiles=${pIds}&offset=${ctx.query.offset}`;
        // const cUrl = `/posts?communities=${cIds}&offset=${ctx.query.offset}`;
        // const [pPosts, cPosts] = await Promise.all([
        //     await request(ctx, hosts.POSTS_API, pUrl, true),
        //     await request(ctx, hosts.POSTS_API, cUrl, true)
        // ]);
        // // delete duplicates
        // data = [...new Set(pPosts.concat(cPosts))];
    });

module.exports = router;

