const Router = require('koa-router');
const router = new Router();

const routeHelpers = require('./_helpers');

// http codes: 301, 307 - repeated post request


router.get('/ping', async (ctx) => {
    ctx.body = 'pong';
});

/* users API */

// register, update, delete, login
router.post('/users', async (ctx) => {
    ctx.redirect(307, `${ctx.users_api_host}/${ctx.path}`);
});
router.put('/users', async (ctx) => {
    ctx.redirect(307, `${ctx.users_api_host}/${ctx.path}`);
});
router.delete('/users', async (ctx) => {
    ctx.redirect(307, `${ctx.users_api_host}/${ctx.path}`);
});
router.get('/profile', async (ctx) => {
    ctx.redirect(301, `${ctx.users_api_host}/${ctx.path}`);
});
router.get('/login', async (ctx) => {
    ctx.redirect(301, `${ctx.users_api_host}/api/v1/users/${ctx.path}`);
});


router.post('/users', async (ctx) => {
    ctx.body = {
        status: 'success',
        message: 'Wellcome to Koa!'
    };
});
module.exports = router;


router.get('/dashboard', async (req, res, next) => {

    /*
    users ids from:
    users where i follow and communities i follow
    sort by 'last_post_at'
    2 requests
    */
    /*
    posts where user_id in UsersArr orWhere community_id in CommsArr
    sort by created_at
    */


    // -> authors -> posts by authors
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset)
        ? --req.query.offset : 0;
    return helpers.getFollowing(req)
        .then((following) => {
            if (!following) throw new Error(`User has no following users`);
            return postsQueries.getDashboardPosts(
                following.map(sub => sub.user_id), offset
            );
        })
        .then((data) => {
            if (data.name) throw new Error(data.detail || data.message);
            return Promise.all([
                data,
                helpers.getUsersData(data.posts.map(u => u.user_id))
            ]);
        })
        .then((arrs) => {
            const [data, users] = arrs;
            if (data.count > 0 && !users) throw new Error(`Users data not fetched`);
            // eslint-disable-next-line
            data.posts.forEach(x => x.author = users.find(y => y.user_id == x.user_id));
            res.status(200).json({
                status: 'success',
                data
            });
        })
        .catch((err) => {
            res.status(500).json({
                status: 'error',
                message: err.message
            });
        });
});