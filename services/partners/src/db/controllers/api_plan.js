const ApiPlan = require('mongoose').model('ApiPlan');

/* api plans */

const create = planObj => new ApiPlan(planObj).save();

const getOne = obj => ApiPlan.findOne(obj);

const getAll = () => ApiPlan.find();

const update = (name, planObj) =>
    ApiPlan.findOneAndUpdate({ name }, planObj, { new: true });

const deleteOne = name => ApiPlan.remove({ name });

module.exports = {
    getAll,
    getOne,
    create,
    update,
    deleteOne
};
