/* eslint-disable no-unused-vars */
const express = require('express');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');

const dbConfig = require('./db-config');
const routes = require('./routes/');
const authentication = require('./auth/');

const app = express();

if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

/* db setup */
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig[process.env.NODE_ENV]);

/* auth */
app.use(authentication);

/* router */
app.get('/api/v1/ping', (req, res) => res.status(200).send('pong'));
app.use('/api/v1/partners', routes);

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

