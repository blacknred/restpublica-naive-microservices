const mongoose = require('mongoose');
const debug = require('debug')('partners-api:mongoose');
const apiPlansSeed = require('./seeds/api_plans');
const partnersAppsSeed = require('./seeds/partner_apps');

const DB_URI = process.env.NODE_ENV !== 'test' ?
    process.env.DATABASE_URL : process.env.DATABASE_URL_TEST;

/* db setup */

module.exports = async (req, res, next) => {
    try {
        await mongoose.connect(DB_URI);
        debug(`Connected to Database: ${DB_URI}`);
        // seeds if needed
        if (process.env.NODE_ENV !== 'production') {
            const apiPlansCount =
                await mongoose.connection.db.collection('ApiPlan').count();
            const partnerAppsCount =
                await mongoose.connection.db.collection('PartnerApp').count();
            if (apiPlansCount <= 0) apiPlansSeed();
            if (partnerAppsCount <= 0) partnersAppsSeed();
        }
    } catch (err) {
        return next(err);
    }
    return next();
};
