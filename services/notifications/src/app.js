const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const useragent = require('express-useragent');
const debug = require('debug')('notifications-api');
const expressValidator = require('express-validator');

const dbInit = require('./db/db_init');
const routes = require('./routes');
const { authentication } = require('./auth');

const app = express();

if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(useragent.express());

/* db setup */
dbInit();

/* auth */
app.use(authentication);

/* router */
app.use('/v1/', routes);

/* 404 and errors handling */
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// eslint-disable-next-line
app.use((err, req, res, next) => {
    debug(err.message);
    res.status(err.status || 500);
    res.json({
        status: 'error',
        message: err.message
    });
});

module.exports = app;

