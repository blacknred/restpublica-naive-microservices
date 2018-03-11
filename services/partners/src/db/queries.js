const mongoose = require('mongoose');

const ApiPlan = mongoose.model('ApiPlan');
const PartnerApp = mongoose.model('PartnerApp');

/* api plans */

const createPlan = (planObj) => {
    const plan = new ApiPlan(planObj);
    plan.save().then(data => data);
};

const getAllPlans = () => {
    ApiPlan.find({}).then(data => data);
};

const getPlan = (name) => {
    ApiPlan.find({ name }).then(data => data);
};

const updatePlan = (name, planObj) => {
    ApiPlan.findOneAndUpdate({ name }, planObj, { new: true })
        .then(data => data);
};

const deletePlan = (name) => {
    ApiPlan.remove({ name }).then(data => data);
};

/* partner apps */

const findAppByDomain = (domain) => {
    PartnerApp.find({ domain }).then(data => data);
};

const checkApp = (apiKey, domain) => {
    PartnerApp.find({ apiKey, domain })
        .then(data => data);
};

const createApp = (appObj) => {
    const app = new PartnerApp(appObj);
    app.save().then(data => data);
};
const getAllApps = () => {
    PartnerApp.find({}).then(data => data);
};

const getApp = (appId) => {
    PartnerApp.findById(appId).then(data => data);
};

const updateApp = (appId, appObj) => {
    PartnerApp.findOneAndUpdate({ _id: appId }, appObj, { new: true })
        .then(data => data);
};

const deleteApp = (appId) => {
    PartnerApp.remove({ _id: appId }).then(data => data);
};

module.exports = {
    getAllPlans,
    getPlan,
    createPlan,
    updatePlan,
    deletePlan,
    findAppByDomain,
    checkApp,
    getAllApps,
    getApp,
    createApp,
    updateApp,
    deleteApp
};
