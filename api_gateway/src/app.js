const fs = require('fs');
const Koa = require('koa');
const path = require('path');
const cors = require('kcors');
const koaBody = require('koa-body');
const morgan = require('koa-morgan');
const helmet = require('koa-helmet');
const routes = require('./routes/index');
const userAgent = require('koa-useragent');
const rfs = require('rotating-file-stream');
const debug = require('debug')('api-gateway');
const { rateLimiting, authentication } = require('./auth');

const app = new Koa();

/* API Gateway */

// logging
// rate-limiting
// authentication
// request routing
// aggregate data
// circuit breaker

// Logger
if (process.env.NODE_ENV !== 'test') {
    // TODO: log stream to Logger microservise
    // moking with rotating write stream
    const logDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    const format = `:method :url :status :response-time ms\
    - :res[content-length] - :remote-addr - :remote-user`;
    app.use(morgan('combined', {
        stream: rfs('access.log', {
            size: '10M',
            interval: '1d',
            compress: 'gzip',
            path: logDir
        })
    }));
    app.use(morgan(format));
}
// CORS
app.use(cors({
    exposeHeaders: ['X-RateLimit-Limit',
        'X-RateLimit-Remaining', 'X-RateLimit-Reset']
}));
// Prevent bruteforce
app.use(helmet());
// Body
app.use(koaBody({ formLimit: '2mb', jsonLimit: '2mb' }));
// Errors
app.use(async (ctx, next) => {
    try {
        await next();
        const status = ctx.status || 404;
        if (status === 404) ctx.throw(404, ctx.body || 'Not Found');
    } catch (err) {
        debug(err.message);
        ctx.status = err.status || 500;
        ctx.body = {
            status: 'error',
            message: process.env.NODE_ENV !== 'production' ?
                err.message : 'Server Error. Try later.'
        };
    }
});
// User Agent
app.use(userAgent);
// Rate-limiting
app.use(rateLimiting);
// Authentication
app.use(authentication);
// Router
app.use(routes.routes());

module.exports = app;
