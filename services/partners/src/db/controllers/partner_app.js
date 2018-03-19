const PartnerApp = require('mongoose').model('PartnerApp');

/* partner apps */

const findAppByDomain = domain => PartnerApp.findOne({ domain });

const checkApp = (apiKey, domain) => PartnerApp.findOne({ apiKey, domain });

const createApp = appObj => new PartnerApp(appObj).save();

const getAllApps = () => PartnerApp.find();

const getApp = (appId, adminId) => PartnerApp.findOne({ _id: appId, adminId });

const updateApp = (appId, appObj, adminId) =>
    PartnerApp.findOneAndUpdate({ _id: appId, adminId }, appObj, { new: true });

const deleteApp = (appId, adminId) => PartnerApp.remove({ _id: appId, adminId });

module.exports = {
    findAppByDomain,
    checkApp,
    getAllApps,
    getApp,
    createApp,
    updateApp,
    deleteApp
};
