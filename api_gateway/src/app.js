const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const morgan = require('koa-morgan');
const cors = require('kcors');
const userAgent = require('koa-useragent');
const cron = require('node-cron');
const rfs = require('rotating-file-stream');
const fs = require('fs');
const path = require('path');
const routes = require('./routes/index');
const { rateLimitPolicy } = require('./consumer_registry');

const app = new Koa();

/*
Entry point API for microservices:
* Cluster support to spawn multiple processes.
* Logging
* Js cron
* Microservices registry mock
* Consumers (users||apps) registry
* Router logic based on user-agent
*/

// Logger
if (process.env.NODE_ENV !== 'test') {
    // TODO: log stream to logger microservise
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
    const format = `:method :url :status :response-time ms\
    - :res[content-length] - :user-agent - :remote-addr - :remote-user`;
    app.use(morgan('combined', { stream: accessLogStream }));
    app.use(morgan(format));
}
// Js cron
cron.schedule('10 * * * *', () => {
    console.log(process.memoryUsage());
    // ?log stream to logger microservise
});
// CORS
app.use(cors());
// Body parsing
app.use(bodyParser({ multipart: true, jsonLimit: '100kb' }));
// Services discovery mock
app.use(async (ctx, next) => {
    // TODO: fetch services registry
    // ?jscron every 30 sec update adresses from redis-cache
    // ping all services
    app.context.users_host = process.env.USERS_API_HOST;
    app.context.communities_host = process.env.COMMUNITIES_API_HOST;
    app.context.posts_host = process.env.POSTS_API_HOST;
    app.context.partners_host = process.env.PARTNERS_API_HOST;
    app.context.users_host = 'http://users-service:3004';
    app.context.communities_host = 'http://communities-service:3005';
    app.context.partners_host = 'http://partners-service:3008';
    app.context.posts_host = 'http://posts-service:3006';
    await next();
});
// Errors
app.use(async (ctx, next) => {
    try {
        await next();
        const status = ctx.status || 404;
        if (status === 404) ctx.throw(404, 'Page Not Found');
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = {
            status: 'error',
            message: process.env.NODE_ENV === 'production' ? {} : err.message
        };
    }
});

// User Agent
app.use(userAgent);
// Consumer rate limit
app.use(rateLimitPolicy);
// Router
app.use(routes.routes());

module.exports = app;
