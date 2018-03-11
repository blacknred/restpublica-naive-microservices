/* eslint-disable no-unused-vars */
const express = require('express');
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const logger = require('morgan');

const authentication = require('./auth/');
const communitiesRoutes = require('./routes/communities');
const subscriptionsRoutes = require('./routes/subscriptions');
const bansRoutes = require('./routes/bans');

const app = express();

if (process.env.NODE_ENV !== 'test') app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));
app.use(expressValidator());

/* auth */
app.use(authentication);

/* router */
app.get('/v1/ping', (req, res) => res.status(200).send('pong'));
app.use('/v1/communities', communitiesRoutes);
app.use('/v1/communities', subscriptionsRoutes);
app.use('/v1/communities', bansRoutes);

/* 404 and errors handling */
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        status: 'error',
        message: err.message
    });
});


module.exports = app;