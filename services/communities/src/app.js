/* eslint-disable no-unused-vars */
const express = require('express');
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const logger = require('morgan');

const routes = require('./routes/communities');
const { ensureAuthenticated } = require('./auth/_helpers');

const app = express();

if (process.env.NODE_ENV !== 'test') app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));
app.use(expressValidator());

/* auth */
app.use(ensureAuthenticated);

/* router */
app.use('/api/v1/communities', routes);

/* errors handling */
app.use((err, req, res, next) => {
    res.status(404);
    next();
    res.status(err.status || 500);
    res.json({
        status: 'error',
        message: err.message || 'Page not found'
    });
});

app.use((req, res) => {
    res.status(404);
    res.json({
        status: 'error',
        message: 'Page not found'
    });
});


module.exports = app;
