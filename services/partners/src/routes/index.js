/* eslint-disable consistent-return */
const express = require('express');
const queries = require('../db/queries');
const validate = require('./validation');

const router = express.Router();

/* api plans */

router.post(`/plans`, validate.plan, async (req, res, next) => {
    const newPlan = {
        name: req.body.name,
        limit: req.body.limit,
        price: req.body.price
    };
    const errors = [];
    try {
        const name = await queries.findPlanByName(newPlan.name);
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

router.get(`/plans`, async (req, res, next) => {
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

router.put(`/plans/:pid`, validate.plan, async (req, res, next) => {
    const planId = req.params.pid;
    const planObj = {
        [req.body.option]: req.body.value
    };
    try {
        const data = await queries.updatePlan(planId, planObj);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete(`/plans/:pid`, validate.plan, async (req, res, next) => {
    const planId = req.params.pid;
    try {
        const data = await queries.deletePlan(planId);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get(`/plans/:pid`, validate.plan, async (req, res, next) => {
    const planId = req.params.pid;
    try {
        const data = await queries.getPlan(planId);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

/* partner apps */

router.post(`/apps/check`, validate.check, async (req, res, next) => {
    const apiKey = req.body.apiKey;
    const domain = req.body.domain;
    try {
        const data = await queries.checkApp(apiKey, domain);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.post(`/apps`, validate.app, async (req, res, next) => {
    const newApp = {
        apiKey: Math.random().toString(36).slice(2),
        planId: req.body.planId,
        adminId: req.body.adminId,
        domain: req.body.domain,
        email: req.body.email,
    };
    const errors = [];
    try {
        const domain = await queries.findAppByDomain(newApp.domain);
        if (domain) {
            errors.push({
                param: 'domain',
                msg: `Domain ${newApp.domain} is already in use`
            });
            throw new Error();
        }
        const data = await queries.createApp(newApp);
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

router.get(`/apps`, async (req, res, next) => {
    try {
        const data = await queries.getAllApps();
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.put(`/apps/:aid`, validate.app, async (req, res, next) => {
    const appId = req.params.aid;
    const appObj = {
        [req.body.option]: req.body.value
    };
    try {
        const data = await queries.updateApp(appId, appObj);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete(`/apps/:aid`, validate.app, async (req, res, next) => {
    const appId = req.params.aid;
    try {
        const data = await queries.deleteApp(appId);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get(`/apps/:aid`, validate.app, async (req, res, next) => {
    const appId = req.params.aid;
    try {
        const data = await queries.getApp(appId);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
