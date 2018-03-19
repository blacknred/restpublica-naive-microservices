/* eslint-disable consistent-return */

const express = require('express');
const PartnerApp = require('../db/controllers/partner_app');
const { apps } = require('./validation');

const router = express.Router();

/* partner apps */

router.post('/', apps, async (req, res, next) => {
    const newApp = {
        apiKey: Math.random().toString(36).slice(2),
        planId: req.body.planId,
        domain: req.body.domain,
        email: req.body.email,
        adminId: req.user,
    };
    try {
        const data = await PartnerApp.createApp(newApp);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.post('/check', apps, async (req, res, next) => {
    const apiKey = req.body.apiKey;
    const domain = req.body.domain;
    try {
        const limit = await PartnerApp.checkApp(apiKey, domain);
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
        const data = await PartnerApp.getAllApps();
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/:aid', apps, async (req, res, next) => {
    const appId = req.params.aid;
    try {
        let data = await PartnerApp.getApp(appId, req.user);
        if (!data) data = 'Access is restricted';
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.put('/:aid', apps, async (req, res, next) => {
    const appId = req.params.aid;
    const appObj = { [req.body.option]: req.body.value };
    try {
        let data = await PartnerApp.updateApp(appId, appObj, req.user);
        if (!data) data = 'Access is restricted';
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:aid', apps, async (req, res, next) => {
    const appId = req.params.aid;
    try {
        let data = await PartnerApp.deleteApp(appId, req.user);
        if (!data) data = 'Access is restricted';
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
