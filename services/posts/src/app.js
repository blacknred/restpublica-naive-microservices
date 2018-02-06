/* eslint-disable no-unused-vars */
const express = require('express');
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
// const logger = require('morgan');

const routes = require('./routes/posts');
const { ensureAuthentication } = require('./auth/_helpers');

const app = express();

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// });
// if (process.env.NODE_ENV !== 'test') { app.use(logger('dev')); }

app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use('/api/v1', routes);

/* errors handling */
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use((err, req, res, next) => {
    const message = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.json({
        status: 'error',
        message: err
    });
});

/* auth */
app.use(ensureAuthentication);

module.exports = app;
