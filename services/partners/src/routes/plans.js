/* eslint-disable consistent-return */
const express = require('express');
const queries = require('../db/queries');
const validate = require('./validation');

const router = express.Router();

/* api plans */

router.post('/', validate.plan, async (req, res, next) => {
    const newPlan = {
        name: req.body.name,
        limit: req.body.limit,
        price: req.body.price
    };
    const errors = [];
    try {
        const name = await queries.getPlan(newPlan.name);
        if (name) {
            errors.push({
                param: 'name',
                msg: `Name ${newPlan.name} is already in use`
            });
            throw new Error();
        }
        const data = await queries.createPlan(newPlan);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        if (errors.length) {
            res.status(422).json({
                status: 'Validation failed',
                failures: errors
            });
        } else {
            return next(err);
        }
    }
});

router.get('/', async (req, res, next) => {
    try {
        const data = await queries.getAllPlans();
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/:name', validate.plan, async (req, res, next) => {
    const name = req.params.name;
    try {
        const data = await queries.getPlan(name);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.put('/:name', validate.plan, async (req, res, next) => {
    const name = req.params.name;
    const planObj = {
        [req.body.option]: req.body.value
    };
    try {
        const data = await queries.updatePlan(name, planObj);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:name', validate.plan, async (req, res, next) => {
    const name = req.params.name;
    try {
        const data = await queries.deletePlan(name);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
