const mongoose = require('mongoose');

const ApiPlan = mongoose.model('ApiPlan');
const PartnerApp = mongoose.model('PartnerApp');

/* api plans */

const createPlan = planObj => new ApiPlan(planObj).save();

const getAllPlans = () => ApiPlan.find();

const getPlan = name => ApiPlan.findOne({ name });

const updatePlan = (name, planObj) => {
    return ApiPlan.findOneAndUpdate({ name }, planObj, { new: true });
};

const deletePlan = name => ApiPlan.remove({ name });

/* partner apps */

const findAppByDomain = domain => PartnerApp.findOne({ domain });

const checkApp = (apiKey, domain) => PartnerApp.findOne({ apiKey, domain });

const createApp = appObj => new PartnerApp(appObj).save();

const getAllApps = () => PartnerApp.find();

const getApp = (appId, adminId) => {
    return PartnerApp.findOne({ _id: appId, adminId });
};

const updateApp = (appId, appObj, adminId) => {
    return PartnerApp.findOneAndUpdate({ _id: appId, adminId },
        appObj, { new: true });
};

const deleteApp = (appId, adminId) => {
    return PartnerApp.remove({ _id: appId, adminId });
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
