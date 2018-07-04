/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */

const Router = require('koa-router');
const hosts = require('../conf');
const { auth } = require('../auth');
const { request } = require('./_helpers');

const router = new Router();

/* Compose multiple backend services and aggregate the results */

router
    .get('/users/:name', async (ctx) => {
        /* get profile */
        const profile = await request({ ctx, host: hosts.USERS_API, url: ctx.url, r: true });
        const res = () => ctx.body = profile;
        /* adds */
        if (profile.status) {
            // get posts count
            const pUrl = `/posts?profile=${profile.data.id}&mode=count`;
            const postsCnt = await request({
                ctx, host: hosts.POSTS_API, url: pUrl, r: true, fallback: res
            });
            profile.data.posts_cnt = postsCnt.data.count;
        }
        res();
    })
    .get('/communities/:name', async (ctx) => {
        /* get community */
        const community =
            await request({ ctx, host: hosts.COMMUNITIES_API, url: ctx.url, r: true });
        const res = () => ctx.body = community;
        /* adds */
        if (community.status) {
            // get posts count & admin data & last members data
            const pUrl = `/posts?community=${community.data.id}&mode=count`;
            const uUrl = `/users?list=${[
                ...community.data.last_members.map(m => m.user_id),
                community.data.admin_id
            ]}`;
            const [postsCnt, users] = await Promise.all([
                request({ ctx, host: hosts.POSTS_API, url: pUrl, r: true, fallback: res }),
                request({ ctx, host: hosts.USERS_API, url: uUrl, r: true, fallback: res }),
            ]);
            community.data.posts_cnt = postsCnt.data.count;
            community.data.admin = users.data.profiles.find(u => u.id === community.data.admin_id);
            community.data.last_members = users.data.profiles
                .filter(u => u.id !== community.data.admin_id);
        }
        res();
    })
    .get('/communities/:cid/(followers|moderators|bans)', async (ctx) => {
        /* get profiles */
        const profiles =
            await request({ ctx, host: hosts.COMMUNITIES_API, url: ctx.url, r: true });
        const res = () => ctx.body = profiles;
        /* adds */
        if (profiles.status) {
            // get profiles data
            const uUrl = `/users?list=${profiles.data.profiles.map(p => p.user_id)}`;
            const profilesData =
                await request({ ctx, host: hosts.USERS_API, url: uUrl, r: true, fallback: res });
            profiles.data.profiles.forEach(x => Object.assign(x, profilesData.data.profiles
                .find(y => y.id === x.user_id)));
        }
        res();
    })

    .post('/posts', auth, async (ctx) => {
        /* create post */
        const post = await request({ ctx, host: hosts.POSTS_API, url: ctx.url, r: true });
        const res = () => ctx.body = post;
        /* adds */
        if (post.status) {
            // update last_post_at option
            ctx.state.method = 'PUT';
            ctx.state.body = {
                option: 'last_post_at',
                value: new Date()
            };
            const cUrl = post.data.community_id ? `/communities/${post.data.community_id}` : null;
            await Promise.all([
                request({ ctx, host: hosts.USERS_API, url: '/users', r: true, fallback: res }),
                !cUrl ? null : request({
                    ctx, host: hosts.COMMUNITIES_API, url: cUrl, r: true, fallback: res
                })
            ]);
        }
        res();
    })
    .get('/posts', async (ctx, next) => {
        /* get posts */
        let pUrl = ctx.url;
        if (ctx.query.feed) {
            // in case of feed request:
            // demand authorization
            await auth(ctx, next);
            // get user following profiles & communities ids -- last week & max 100
            const uUrl = `/users/${ctx.state.consumer}/feed`;
            const cUrl = `/communities?profile=${ctx.state.consumer}&mode=feed`;
            const [followingProfiles, followingCommunities] = await Promise.all([
                request({ ctx, host: hosts.USERS_API, url: uUrl, r: true }),
                request({ ctx, host: hosts.COMMUNITIES_API, url: cUrl, r: true })
            ]);
            const profilesId = followingProfiles.data.map(p => p.user_id);
            const communitiesId = followingCommunities.data.communities.map(c => c.id);
            pUrl = `${ctx.url}&profiles=${profilesId}&communities=${communitiesId}`;
            // TODO: implement ctx.query.feed_rand logic
        }
        const posts = await request({ ctx, host: hosts.POSTS_API, url: pUrl, r: true });
        const res = () => ctx.body = posts;

        /* adds */
        if (posts.status) {
            // get authors data of posts and posts' comments
            const postsAuthorsId = posts.data.posts.map(post => post.author_id);
            const commentsAuthorsId = [].concat(...posts.data.posts
                .map(post => post.comments.map(com => com.user_id)));
            const profilesId = [...new Set(postsAuthorsId.concat(commentsAuthorsId))];
            const uUrl = `/users?list=${profilesId}`;
            // get communities names
            const communitiesId = [...new Set(posts.data.posts.map(p => p.community_id))];
            const cUrl = `/communities?list=${communitiesId.filter(p => p > 0)}&lim=name`;
            const [authors, communities] = await Promise.all([
                request({ ctx, host: hosts.USERS_API, url: uUrl, r: true, fallback: res }),
                request({ ctx, host: hosts.COMMUNITIES_API, url: cUrl, r: true, fallback: res })
            ]);
            // combine data
            posts.data.posts.forEach((x) => {
                x.author = authors.data.profiles.find(y => y.id === x.author_id);
                x.community_name = communities.data.communities
                    .find(y => y.id === x.community_id);
                if (x.community_name) x.community_name = x.community_name.name;
                x.comments.forEach((com) => {
                    com.author = authors.data.profiles.find(y => y.id === com.user_id);
                });
            });
        }
        res();
    })
    .get('/posts/:slug', async (ctx) => {
        /* get post */
        const post = await request({ ctx, host: hosts.POSTS_API, url: ctx.url, r: true });
        const res = () => ctx.body = post;
        /* adds */
        if (post.status) {
            // get authors data & communities name
            const uUrl = `/users?list=${post.data.author_id}`;
            const cUrl = `/communities?list=${post.data.community_id}&lim=name`;
            const [author, community] = await Promise.all([
                request({ ctx, host: hosts.USERS_API, url: uUrl, r: true, fallback: res }),
                !post.data.community_id ? null : request({
                    ctx, host: hosts.COMMUNITIES_API, url: cUrl, r: true, fallback: res
                })
            ]);
            post.data.author = author.data.profiles[0];
            if (community) post.data.communityName = community.data.communities[0].name;
        }
        res();
    })
    .get('/posts/:pid/(comments|likes|votes)', async (ctx) => {
        /* get data */
        const data = await request({ ctx, host: hosts.POSTS_API, url: ctx.url, r: true });
        const res = () => ctx.body = data;
        /* adds */
        if (data.status) {
            // get authors data
            const authorsId = [...new Set(data.data.comments.map(com => com.user_id))];
            const profiles = await request({
                ctx, host: hosts.USERS_API, url: `/users?list=${authorsId}`, r: true, fallback: res
            });
            data.data.data.forEach(x => x.author = profiles.data.profiles
                .find(y => y.id === x.user_id));
        }
        res();
    });

module.exports = router;

