const Notification = require('mongoose').model('Notification');
const debug = require('debug')('notifications-api:mongoose');

module.exports = function seedNotifications() {
    Notification.findOne()
        .populate('name')
        .exec((err, doc) => {
            if (err) debug('Notification mode: %s', err);
            if (!doc) {
                // const notifications = [
                //     {
                //         apiKey: Math.random().toString(36).slice(2),
                //         planId: 1,
                //         adminId: 1,
                //         domain: 'fugoo.co',
                //         email: 'email@fugoo.com'
                //     },
                //     {
                //         apiKey: Math.random().toString(36).slice(2),
                //         planId: 2,
                //         adminId: 2,
                //         domain: 'rag.ee',
                //         email: 'email@rag.ee'
                //     },
                //     {
                //         apiKey: Math.random().toString(36).slice(2),
                //         planId: 3,
                //         adminId: 3,
                //         domain: 'whatabout.it',
                //         email: 'email@whatabout.it'
                //     }
                // ];

                // notifications.forEach(plan => new Notification(plan).save());
                debug('Notification model seeded!');
            }
        });
};

