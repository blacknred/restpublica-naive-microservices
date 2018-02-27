/* eslint-disable consistent-return */
const express = require('express');
const queries = require('../db/queries');
const validate = require('./validation');

const router = express.Router();

/* partner apps */

router.post('/', validate.app, async (req, res, next) => {
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

router.post('/check', validate.check, async (req, res, next) => {
    const apiKey = req.body.apiKey;
    const domain = req.body.domain;
    try {
        const limit = await queries.checkApp(apiKey, domain);
        res.status(200).json({
            status: 'success',
            limit
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/', async (req, res, next) => {
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

router.get('/:aid', validate.app, async (req, res, next) => {
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

router.put('/:aid', validate.app, async (req, res, next) => {
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

router.delete('/:aid', validate.app, async (req, res, next) => {
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

module.exports = router;
