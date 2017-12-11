const fs = require('fs');
const util = require('util');

const mkdir = util.promisify(fs.mkdir);

const path = require('path');
const logger = require('koa-logger');
const serve = require('koa-static');
const koaBody = require('koa-body');
const Koa = require('koa');

const app = new Koa();

// log requests
app.use(logger());

// multipart
app.use(koaBody({ multipart: true }));

/* 404 */
app.use(async (ctx, next) => {
    await next();
    if (ctx.body || !ctx.idempotent) return;
    ctx.redirect('/');
});

// serve static files from ./static
app.use(serve(path.join(__dirname, '/static')));

/* handle uploads */
/* eslint-disable consistent-return */
app.use(async (ctx, next) => {
    // ignore non-POSTs
    if (ctx.method !== 'POST') { await next(); }

    const filesDir = Math.random().toString(36).slice(2);
    const fullFilesDir = path.join(__dirname, 'static', filesDir);
    const filesPaths = [];
    const files = ctx.request.body.files || {};

    try {
        // create a folder to store files
        await mkdir(fullFilesDir);

        // handle files and files paths
        /* eslint-disable */
        for (let key in files) {
            const file = files[key];
            if (!file.path) { return ctx.throw(404, 'The files must have names'); }
            const fileName = (file.name).replace(/\s/g, '');
            const filePath = path.join(fullFilesDir, fileName);
            const reader = await fs.createReadStream(file.path);
            const writer = await fs.createWriteStream(filePath);
            await reader.pipe(writer);
            console.log('uploading %s -> %s', fileName, writer.path);
            filesPaths.push({
                url: /* ctx.request.URL */ 'localhost:3003/' + filesDir + '/' + fileName,
                mime: (file.type).replace('-', '/')
            });
        }
        /* eslint-enable */
    } catch (err) {
        console.log(err);
    }

    // return paths
    ctx.body = filesPaths;
});

/* listen */
if (!module.parent) {
    app.listen(3003);
    console.log('File upload and static server is listening on port 3003');
}
