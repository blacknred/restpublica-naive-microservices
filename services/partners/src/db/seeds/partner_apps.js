const PartnerApp = require('mongoose').model('PartnerApp');
const debug = require('debug')('partners-api:mongoose');

module.exports = function seedPartnerApps() {
    const apps = [
        {
            apiKey: Math.random().toString(36).slice(2),
            planId: 1,
            adminId: 1,
            domain: 'fugoo.co',
            email: 'email@fugoo.com'
        },
        {
            apiKey: Math.random().toString(36).slice(2),
            planId: 2,
            adminId: 2,
            domain: 'rag.ee',
            email: 'email@rag.ee'
        },
        {
            apiKey: Math.random().toString(36).slice(2),
            planId: 3,
            adminId: 3,
            domain: 'whatabout.it',
            email: 'email@whatabout.it'
        }
    ];

    apps.forEach(app => new PartnerApp(app).save());

    debug('PartnerApp model seeded!');
};

