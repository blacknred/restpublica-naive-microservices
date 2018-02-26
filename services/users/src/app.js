/* eslint-disable no-unused-vars */
const express = require('express');
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const logger = require('morgan');

const routes = require('./routes/');
const authentication = require('./auth/');

const app = express();

if (process.env.NODE_ENV !== 'test') { app.use(logger('dev')); }
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));
app.use(expressValidator());

/* auth */
app.use(authentication);

/* router */
app.get('/api/v1/ping', (req, res) => res.status(200).send('pong'));
app.use('/api/v1/users', routes);

/* 404 and errors handling */
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500);
    res.json({
        status: 'error',
        message: err.message
    });
});


module.exports = app;

