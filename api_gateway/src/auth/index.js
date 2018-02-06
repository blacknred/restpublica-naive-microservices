/* esvlint-disable */
const request = require('request-promise');
const moment = require('moment');
const jwt = require('jwt-simple');

const encode = require('./encode');

const freeAccessEndpoints = [
    '/user/:username',
    '/trending',
    '/trending/noposts',
    '/search/:query',
    '/community/:name'
];

function encodeToken(userId) {
    const playload = {
        exp: moment().add(5, 'secounds').unix(),
        iat: moment().unix(),
        sub: userId,
    };
    return jwt.encode(playload, process.env.TOKEN_SECRET);
}

export const authentication = async (ctx, next) => {
    if (process.env.NODE_ENV === 'test') {
        ctx.state.user = 1;
        await next();
    }
    ctx.state.user = null;
    // check user id in case path is secure 
    if (!freeAccessEndpoints.indexOf(ctx.path)) {
        const authHeader = ctx.headers.authentication
        if (!authHeader) ctx.throw(400, 'error', { status: 'Please log in' })
        const options = {
            method: 'GET',
            uri: `${ctx.users_api_host}/api/v1/users/check`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authHeader.split(' ')[1]}`,
            },
        };
        try {
            const user = await request(options)
            ctx.state.user = user.id;
        } catch (err) {
            console.log(err.message)
            ctx.throw(400, 'error')
        }
    }
    // create short-lived token and set auth header
    const token = await encode(ctx.state.user);
    ctx.set('Authorization', `Bearer ${token}`);
    // go next
    await next();
}