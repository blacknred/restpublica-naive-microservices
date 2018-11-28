const Notification = require('mongoose').model('Notification');
const debug = require('debug')('notifications-api:mongoose');

module.exports = function seedNotifications() {
    Notification.findOne()
        .populate('originId')
        .exec((err, doc) => {
            if (err) debug('Notification mode: %s', err);
            if (!doc) {
                const notifications = [
                    {
                        originId: 1,
                        targetId: 2,
                    },
                ];
                notifications.forEach(note => new Notification(note).save());
                debug('Notification model seeded!');
            }
        });
};

