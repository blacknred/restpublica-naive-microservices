/* eslint-disable consistent-return */
/* eslint-disable no-throw-literal */

const express = require('express');
const ApiPlan = require('../db/controllers/api_plan');
const { planValidation } = require('./validation');
const { ensureAuthenticated } = require('../auth');

const router = express.Router();

/* api planValidation */

router.post('/', planValidation, async (req, res, next) => {
    const newPlan = {
        name: req.body.name,
        limit: req.body.limit,
        price: req.body.price
    };
    try {
        const plan = await ApiPlan.getOne({ name: newPlan.name });
        if (plan) throw { status: 409, message: 'Api plan name already in use' };
        if (plan.limit === newPlan.limit) {
            throw { status: 409, message: 'Api plan limit already in use' };
        }
        const data = await ApiPlan.create(newPlan);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.get('/', ensureAuthenticated, async (req, res, next) => {
    try {
        const data = await ApiPlan.getAll();
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.get('/:name', ensureAuthenticated, planValidation, async (req, res, next) => {
    const name = req.params.name.toLowerCase();
    try {
        const plan = await ApiPlan.getOne({ name });
        if (!plan) throw { status: 404, message: 'Api plan not found' };
        res.status(200).json({ status: 'success', data: plan });
    } catch (err) {
        return next(err);
    }
});

router.put('/:name', planValidation, async (req, res, next) => {
    const name = req.params.name;
    const planObj = { [req.body.option]: req.body.value };
    try {
        const plan = await ApiPlan.getOne({ name });
        if (!plan) throw { status: 404, message: 'Api plan not found' };
        if (req.body.option === 'name') {
            const newName = await ApiPlan.getOne({ name: req.body.value });
            if (newName) throw { status: 409, message: 'Api plan name already in use' };
        }
        if (req.body.option === 'limit') {
            const limit = await ApiPlan.getOne({ limit: req.body.value });
            if (limit) throw { status: 409, message: 'Api plan limit already in use' };
        }
        const data = await ApiPlan.update(name, planObj);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:name', planValidation, async (req, res, next) => {
    const name = req.params.name;
    try {
        const plan = await ApiPlan.getOne({ name });
        if (!plan) throw { status: 404, message: 'Api plan not found' };
        const data = await ApiPlan.deleteOne(name);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
