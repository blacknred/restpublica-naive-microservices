const express = require('express');
const expressValidator = require('express-validator');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const routes = require('./routes/posts');

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

if (process.env.NODE_ENV !== 'test') { app.use(logger('dev')); }
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator());

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }
}));

app.use('/api/v1/posts', routes);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
    const message = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.json({
        status: 'error',
        message: err
    });
});
/* eslint-enable no-unused-vars */

module.exports = app;
