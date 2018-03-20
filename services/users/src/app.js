const logger = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const debug = require('debug')('users-api');
const useragent = require('express-useragent');
const expressValidator = require('express-validator');
const { authentication } = require('./auth');
const usersRoutes = require('./routes/users');
const subscriptionsRoutes = require('./routes/subscriptions');

const app = express();

if (process.env.NODE_ENV !== 'test') app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(expressValidator());
app.use(useragent.express());

/* auth */
app.use(authentication);

/* router */
app.get('/v1/ping', (req, res) => res.status(200).send('pong'));
app.use('/v1/users', usersRoutes);
app.use('/v1/users', subscriptionsRoutes);

/* 404 and errors handling */
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use((err, req, res) => {
    debug(err.message);
    res.status(err.status || 500);
    res.json({
        status: 'error',
        message: err.message
    });
});


module.exports = app;

