const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const morgan = require('koa-morgan');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const rfs = require('rotating-file-stream');
const routes = require('./routes/index');
const { rateLimitPolicy, createToken } = require('./consumer_registry');

const app = new Koa();

/* ** logger ** */
// TODO: log stream to logger microservise
if (process.env.NODE_ENV !== 'test') {
    const logDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    // create a rotating write stream
    const accessLogStream = rfs('access.log', {
        size: '10M',
        interval: '1d', // rotate daily
        compress: 'gzip',
        path: logDir
    });
    // setup the logger
    app.use(morgan('combined', { stream: accessLogStream }));
}

/* ** js cron ** */
cron.schedule('* 59 * * *', () => {
    console.log(process.memoryUsage());
    // ?log stream to logger microservise
});

/* ** services registry mock ** */
app.use(async (ctx, next) => {
    // TODO: fetch services registry
    app.context.users_api_host = process.env.USERS_API_HOST;
    app.context.communities_api_host = process.env.COMMUNITIES_API_HOST;
    app.context.posts_api_host = process.env.POSTS_API_HOST;
    await next();
});

/* ** errors ** */
app.use(async (ctx, next) => {
    try {
        await next();
        const status = ctx.status || 404;
        if (status === 404) ctx.throw(404, 'Page Not Found');
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = {
            status: 'error',
            message: err.message || {}
        };
        // ctx.app.emit('error', err, ctx);
    }
});

/* ** CORS ** */
app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    await next();
});

/* ** body parsing ** */
app.use(bodyParser({ multipart: true, jsonLimit: '100kb' }));

/* ** consumer rate limit ** */
app.use(rateLimitPolicy);

/* ** createToken ** */
app.use(createToken);

/* ** router ** */
app.use(routes.routes());


module.exports = app;
