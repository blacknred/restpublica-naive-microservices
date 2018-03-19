const ApiPlan = require('mongoose').model('ApiPlan');

/* api plans */

const createPlan = planObj => new ApiPlan(planObj).save();

const getAllPlans = () => ApiPlan.find();

const getPlan = name => ApiPlan.findOne({ name });

const updatePlan = (name, planObj) =>
    ApiPlan.findOneAndUpdate({ name }, planObj, { new: true });

const deletePlan = name => ApiPlan.remove({ name });

module.exports = {
    getAllPlans,
    getPlan,
    createPlan,
    updatePlan,
    deletePlan
};
