const express = require('express');
const expressValidator = require('express-validator');
const debug = require('debug')('partners-api');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const useragent = require('express-useragent');
const dbInit = require('./db/init');
const plansRoutes = require('./routes/plans');
const appsRoutes = require('./routes/apps');
const { authentication } = require('./auth');

const app = express();

if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(useragent.express());

/* db setup */
app.use(dbInit);

/* auth */
app.use(authentication);

/* router */
app.get('/v1/ping', res => res.status(200).send('pong'));
app.use('/v1/plans', plansRoutes);
app.use('/v1/apps', appsRoutes);

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

