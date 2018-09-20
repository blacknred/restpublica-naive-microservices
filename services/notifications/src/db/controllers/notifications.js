const Notification = require('mongoose').model('Notification');

/* notifications */

const create = noteObj => new Notification(noteObj).save();

const getAll = targetId => Notification.find({ targetId });

const deleteOne = (id, targetId) => Notification.remove({ _id: id, targetId });

const deleteAll = targetId => Notification.remove({ targetId });

// const update = ({ appId, appObj, adminId }) =>
//     PartnerApp.findOneAndUpdate({ _id: appId, adminId }, appObj, { new: true });

module.exports = {
    create,
    getAll,
    deleteOne,
    deleteAll,
};

