/* eslint-disable consistent-return */
/* eslint-disable no-throw-literal */

const express = require('express');
const PartnerApp = require('../db/controllers/partner_app');
const ApiPlan = require('../db/controllers/api_plan');
const { appValidation } = require('./validation');
const { ensureAuthenticated } = require('../auth');

const router = express.Router();

/* partner apps */

router.post('/', ensureAuthenticated, appValidation,
    async (req, res, next) => {
        const newApp = {
            apiKey: Math.random().toString(36).slice(2),
            planId: req.body.planId,
            domain: req.body.domain,
            email: req.body.email,
            adminId: req.user,
        };
        try {
            const plan = await ApiPlan.getOne({ _id: req.body.planId });
            if (!plan) {
                throw {
                    status: 409,
                    message: { param: 'plan', msg: 'Api plan is not in use' }
                };
            }
            const domain = await PartnerApp.getOne({ domain: req.body.value });
            if (domain) {
                throw {
                    status: 409,
                    message: { param: 'domain', msg: 'Domain is already in use' }
                };
            }
            const data = await PartnerApp.create(newApp);
            res.status(200).json({ status: 'success', data });
        } catch (err) {
            return next(err);
        }
    }
);

router.post('/check', appValidation, async (req, res, next) => {
    const apiKey = req.body.apiKey;
    const domain = req.body.domain;
    try {
        const app = await PartnerApp.getOne({ apiKey, domain });
        if (!app) throw { status: 404, message: 'App not found' };
        res.status(200).json({ status: 'success', data: app.limit });
    } catch (err) {
        return next(err);
    }
});

router.get('/', ensureAuthenticated, async (req, res, next) => {
    try {
        const data = await PartnerApp.getAll();
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.get('/:aid', ensureAuthenticated, appValidation,
    async (req, res, next) => {
        try {
            const app = await PartnerApp.getOne({ _id: req.params.aid });
            if (!app) throw { status: 404, message: 'App not found' };
            if (app.adminId !== req.user) {
                throw { status: 403, message: 'Permission denied' };
            }
            res.status(200).json({ status: 'success', data: app });
        } catch (err) {
            return next(err);
        }
    }
);

router.put('/:aid', ensureAuthenticated, appValidation,
    async (req, res, next) => {
        const appId = req.params.aid;
        const appObj = { [req.body.option]: req.body.value };
        try {
            const app = await PartnerApp.getOne({ _id: req.params.aid });
            if (!app) throw { status: 404, message: 'App not found' };
            if (app.adminId !== req.user) {
                throw { status: 403, message: 'Permission denied' };
            }
            if (req.body.option === 'domain') {
                const domain = await PartnerApp.getOne({ domain: req.body.value });
                if (domain) {
                    throw {
                        status: 409,
                        message: { param: 'domain', msg: 'Domain is already in use' }
                    };
                }
            }
            const data = await PartnerApp.update({ appId, appObj, adminId: req.user });
            res.status(200).json({ status: 'success', data });
        } catch (err) {
            return next(err);
        }
    }
);

router.delete('/:aid', ensureAuthenticated, appValidation,
    async (req, res, next) => {
        const appId = req.params.aid;
        try {
            const app = await PartnerApp.getOne({ _id: req.params.aid });
            if (!app) throw { status: 404, message: 'App not found' };
            if (app.adminId !== req.user) {
                throw { status: 403, message: 'Permission denied' };
            }
            const data = await PartnerApp.deleteOne(appId, req.user);
            res.status(200).json({ status: 'success', data });
        } catch (err) {
            return next(err);
        }
    }
);


module.exports = router;
