const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');

const indexRoutes = require('./routes/');
const { authentication } = require('./auth/');

const app = new Koa();

/* ** logger ** */
if (process.env.NODE_ENV !== 'test') app.use(logger());
app.use(() => console.log(process.memoryUsage()));

/* ** CORS ** */
app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    await next();
});

/* ** services registry support ** */
app.use(async (ctx, next) => {
    app.context.users_api_host = process.env.USERS_API_HOST;
    app.context.communities_api_host = process.env.COMMUNITIES_API_HOST;
    app.context.posts_api_host = process.env.POSTS_API_HOST;
    await next();
});

/* ** errors ** */
app.use(async (ctx, next) => {
    await next();
    if (ctx.body || !ctx.idempotent) return;
    ctx.status = 404;
    ctx.body({
        status: 'Page Not Found'
    });
});
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        const message = process.env.NODE_ENV === 'development' ? err.message : {};
        ctx.status = err.status || 500;
        ctx.body = {
            status: 'error',
            message
        };
        // since we handled this manually we'll want to
        // delegate to the regular app level error handling
        ctx.app.emit('error', err, ctx);
    }
});

/* ** authentication ** */
app.use(authentication);

/* ** body parsing ** */
app.use(bodyParser({ multipart: true, jsonLimit: '100kb' }));

/* ** router ** */
app.use('/api/v1', indexRoutes.routes());

module.exports = app;
