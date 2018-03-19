/* eslint-disable consistent-return */

const express = require('express');
const ApiPlan = require('../db/controllers/api_plan');
const { plans } = require('./validation');

const router = express.Router();

/* api plans */

router.post('/', plans, async (req, res, next) => {
    const newPlan = {
        name: req.body.name,
        limit: req.body.limit,
        price: req.body.price
    };
    try {
        const data = await ApiPlan.createPlan(newPlan);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const data = await ApiPlan.getAllPlans();
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/:name', plans, async (req, res, next) => {
    const name = req.params.name.toLowerCase();
    try {
        const data = await ApiPlan.getPlan(name);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.put('/:name', plans, async (req, res, next) => {
    const name = req.params.name;
    const planObj = { [req.body.option]: req.body.value };
    try {
        const data = await ApiPlan.updatePlan(name, planObj);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:name', plans, async (req, res, next) => {
    const name = req.params.name;
    try {
        const data = await ApiPlan.deletePlan(name);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
