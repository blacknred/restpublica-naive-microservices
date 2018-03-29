const ApiPlan = require('mongoose').model('ApiPlan');
const debug = require('debug')('partners-api:mongoose');

module.exports = function seedApiPlans() {
    ApiPlan.findOne()
        .populate('name')
        .exec((err, doc) => {
            if (err) debug('ApiPlan mode: %s', err);
            if (!doc) {
                const plans = [
                    { name: 'light', limit: 50, price: 0 },
                    { name: 'medium', limit: 1000, price: 5 },
                    { name: 'ultimate', limit: 10000, price: 50 }
                ];
                plans.forEach(plan => new ApiPlan(plan).save());
                debug('ApiPlan model seeded!');
            }
        });
};

