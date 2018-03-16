const ApiPlan = require('mongoose').model('ApiPlan');

module.exports = function seedApiPlans() {
    const plans = [
        { name: 'light', limit: 50, price: 0 },
        { name: 'medium', limit: 1000, price: 5 },
        { name: 'ultimate', limit: 10000, price: 50 }
    ];

    plans.forEach((plan) => {
        const newPlan = new ApiPlan(plan);
        newPlan.save();
    });

    console.log('ApiPlan model seeded!');
};

