/* eslint-disable consistent-return */
const path = require('path');
const logger = require('koa-logger');
const serve = require('koa-static');
const koaBody = require('koa-body');
const Koa = require('koa');
const fs = require('fs');
const util = require('util');

const mkdir = util.promisify(fs.mkdir);
const app = new Koa();

/* log requests */
app.use(logger());

/* multipart */
app.use(koaBody({ multipart: true }));

/* errors */
app.use(async (ctx, next) => {
    await next();
    if (ctx.body || !ctx.idempotent) return;
    ctx.redirect('/');
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

/* serve static files */
app.use(serve(path.join(__dirname, '/static')));

/* handle uploads */
app.use(async (ctx, next) => {
    // ignore non-POSTs
    if (ctx.method !== 'POST') await next();
    const filesDir = Math.random().toString(36).slice(2);
    const filesDirPath = path.join(__dirname, 'static', filesDir);
    const requestFiles = Object.values(ctx.request.body.files || {});
    const responseFilesPaths = [];
    try {
        // create a folder to store files
        await mkdir(filesDirPath);
        // handle files and files paths
        requestFiles.forEach(async (file) => {
            // check names
            if (!file.path) { return ctx.throw(400, 'The files must have names'); }
            const fileName = (file.name).replace(/\s/g, '');
            const filePath = path.join(filesDirPath, fileName);
            const reader = await fs.createReadStream(file.path);
            const writer = await fs.createWriteStream(filePath);
            await reader.pipe(writer);
            console.log('uploading %s -> %s', fileName, writer.path);
            responseFilesPaths.push({
                url: `http://localhost:3007/${filesDir}/${fileName}`, /* ctx.request.URL */
                mime: (file.type).replace('-', '/')
            });
        });
    } catch (err) { console.log(err); }
    // return file locations
    ctx.body = responseFilesPaths;
});

/* listen */
if (!module.parent) {
    app.listen(3007);
    console.log('File upload and static server is listening on port 3007');
}
