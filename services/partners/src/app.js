const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const dbConfig = require('./db-config');
const routes = require('./routes/');
const { ensureAuthenticated } = require('./auth/_helpers');

const app = express();

if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

/* auth */
app.use(ensureAuthenticated);

/* router */
app.use('/api/v1/partners', routes);

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

/* db setup */
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig[process.env.NODE_ENV]);

module.exports = app;

