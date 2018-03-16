/* eslint-disable no-unused-vars */
const express = require('express');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const apiPlans = require('./db/api_plans_model');
const partnersApps = require('./db/partner_apps_model');
const partnersPlansSeed = require('./db/api_plans_seed');
const partnersAppsSeed = require('./db/partner_apps_seed');

const plansRoutes = require('./routes/plans');
const appsRoutes = require('./routes/apps');
const authentication = require('./auth/');

const app = express();
const mongoUrl = process.env.NODE_ENV !== 'test' ?
    process.env.DATABASE_URL : process.env.DATABASE_URL_TEST;

if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator());

/* db setup */
mongoose.connect(mongoUrl, (err, res) => {
    if (err) {
        console.log(`Error connecting to the database. ${err}`);
    } else {
        console.log(`Connected to Database: ${mongoUrl}`);
        partnersPlansSeed();
        partnersAppsSeed();
    }
});

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
app.use((err, req, res, next) => {
    console.log(err.message);
    res.status(err.status || 500);
    res.json({
        status: 'error',
        message: err.message
    });
});


module.exports = app;

