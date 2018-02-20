const ApiPlan = require('mongoose').model('ApiPlan');

const seedApiPlans = () => {
    // create some plans
    const plans = [
        { name: 'light', limit: 50, price: 0 },
        { name: 'Medium', limit: 1000, price: 5 },
        { name: 'Ultimate', limit: 10000, price: 50 }
    ];

    plans.forEach((plan) => {
        const newPlan = new ApiPlan(plan);
        newPlan.save();
    });

    // seeded!
    console.log('ApiPlan model seeded!');
};

module.exports.seedApiPlans = seedApiPlans;
