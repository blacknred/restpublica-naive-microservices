const Koa = require('koa');
const koaBody = require('koa-body');
const morgan = require('koa-morgan');
const cors = require('kcors');
const userAgent = require('koa-useragent');
const cron = require('node-cron');
const rfs = require('rotating-file-stream');
const fs = require('fs');
const path = require('path');
const routes = require('./routes/index');
const { serviceDiscovery } = require('./services');
const { rateLimitPolicy } = require('./auth');

const app = new Koa();

/*
Entry point API for microservices:
* Cluster support to spawn multiple processes.
* Logging
* Js cron
* Microservices registry mock
* Consumers (users||apps) rate/limit and auth
* Circuit breaker and fallbacks
*/

// Logger
if (process.env.NODE_ENV !== 'test') {
    // TODO: log stream to logger microservise
    // mock
    const logDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    // create a rotating write stream
    const accessLogStream = rfs('access.log', {
        size: '10M',
        interval: '1d',
        compress: 'gzip',
        path: logDir
    });
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
// Body
app.use(koaBody({ jsonLimit: '100kb' }));
// Services discovery
app.use(serviceDiscovery);
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
            message: err.message
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
