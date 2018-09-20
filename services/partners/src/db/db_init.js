/* eslint-disable global-require */

const debug = require('debug')('partners-api:mongoose');
const mongoose = require('mongoose');

const DB_URI = process.env.NODE_ENV !== 'test' ?
    process.env.DATABASE_URL : process.env.DATABASE_URL_TEST;
mongoose.Promise = Promise;
mongoose.connect(DB_URI);

const ApiPlan = require('./models/ApiPlan');
const PartnerApp = require('./models/PartnerApp');

const db = mongoose.connection;

/* db setup */

module.exports = () => {
    ApiPlan.collection.drop();
    PartnerApp.collection.drop();
    db.on('error', err => console.log(err));
    db.on('open', async () => {
        debug(`Connected to Database: ${DB_URI}`);
        // seeds if needed
        if (process.env.NODE_ENV !== 'production') {
            require('./seeds/api_plans')();
            require('./seeds/partner_apps')();
        }
    });
};
