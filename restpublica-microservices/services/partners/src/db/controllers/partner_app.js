const PartnerApp = require('mongoose').model('PartnerApp');

/* partner apps */

const create = appObj => new PartnerApp(appObj).save();

const getOne = obj => PartnerApp.findOne(obj);

const getAll = () => PartnerApp.find();

const update = ({ appId, appObj, adminId }) =>
    PartnerApp.findOneAndUpdate({ _id: appId, adminId }, appObj, { new: true });

const deleteOne = (appId, adminId) => PartnerApp.remove({ _id: appId, adminId });

module.exports = {
    getAll,
    getOne,
    create,
    update,
    deleteOne
};
