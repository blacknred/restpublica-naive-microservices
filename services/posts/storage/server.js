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

/* errors */
app.use(async (ctx, next) => {
    try {
        await next();
        const status = ctx.status || 404;
        if (status === 404) ctx.throw(404, 'File Not Found');
    } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = {
            status: 'error',
            message: err.message || {}
        };
        // ctx.app.emit('error', err, ctx);
    }
});

/* serve static files */
app.use(serve(path.join(__dirname, '/static')));

/* multipart */
app.use(koaBody({ multipart: true }));

/* router */
app.use(async (ctx, next) => {
    /* eslint-disable no-case-declarations */
    switch (ctx.method) {
        case 'POST':
            const d = Math.random().toString(36).slice(2); // filesDir
            const dir = path.join(__dirname, 'static', d);
            const reqFiles = Object.values(ctx.request.body.files || {});
            const resFilesPaths = [];
            try {
                await mkdir(dir);
                // handle files and files paths
                reqFiles.forEach(async (file) => {
                    // check names
                    if (!file.path) {
                        return ctx.throw(400, 'The files must have names');
                    }
                    const fileName = (file.name).replace(/\s/g, '');
                    const filePath = path.join(dir, fileName);
                    const reader = await fs.createReadStream(file.path);
                    const writer = await fs.createWriteStream(filePath);
                    await reader.pipe(writer);
                    console.log('uploading %s -> %s', fileName, writer.path);
                    resFilesPaths.push({
                        url: `http://localhost:3007/${d}/${fileName}`, /* ctx.request.URL */
                        mime: (file.type).replace('-', '/')
                    });
                });
            } catch (err) {
                console.log(err.message);
                ctx.throw(500, err.message);
            }
            // return file locations
            ctx.body = resFilesPaths;
            break;
        case 'DELETE':
            const filePath = path.join(__dirname, 'static', ctx.path);
            try {
                await fs.unlinkSync(filePath);
                console.log('deleting %s from %s', ctx.path, filePath);
            } catch (err) {
                console.log(err.message);
                ctx.throw(500, err.message);
            }
            break;
        default: await next();
    }
});

/* listen */
if (!module.parent) {
    app.listen(3007);
    console.log('Mock files storage is listening on port 3007');
}
