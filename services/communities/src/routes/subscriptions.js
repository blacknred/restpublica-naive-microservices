/* eslint-disable consistent-return */
/* eslint-disable no-throw-literal */

const express = require('express');
const Subscription = require('../db/models/Subscription');
const Community = require('../db/models/Community');
const { subscriptions } = require('./validation');
const { ensureAuthenticated } = require('../auth');

const router = express.Router();

/* subscriptions */

router.post('/:cid/follow', ensureAuthenticated, subscriptions,
    async (req, res, next) => {
        const newSubscription = {
            community_id: req.params.uid,
            user_id: req.user
        };
        try {
            const community = await Community.isExist({ id: req.params.cid });
            if (!community) throw { status: 404, message: 'Community not found' };
            if (!community.restricted) newSubscription.approved = true;
            const data = await Subscription.create(newSubscription);
            res.status(200).json({ status: 'success', data });
        } catch (err) {
            return next(err);
        }
    }
);

router.get('/:cid/followers', ensureAuthenticated, subscriptions,
    async (req, res, next) => {
        const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ?
            --req.query.offset : 0;
        const reduced = req.useragent.isMobile || req.query.reduced || false;
        const pending = req.query.pending || null;
        try {
            const community = await Community.isExist({ id: req.params.cid });
            if (!community) throw { status: 404, message: 'Community not found' };
            const data = await Subscription.getAllFollowers(req.params.cid, req.user,
                community.admin_id, pending, offset, reduced);
            res.status(200).json({ status: 'success', data });
        } catch (err) {
            return next(err);
        }
    }
);

router.delete('/:cid/follow/:sid', ensureAuthenticated, subscriptions,
    async (req, res, next) => {
        try {
            const sub = await Subscription.isExist(req.params.sid);
            if (!sub) throw { status: 404, message: 'Subscription not found' };
            if (sub.user_id !== req.user) {
                throw { status: 403, message: 'Permission denied' };
            }
            await Subscription.deleteOne()(req.params.sid, req.params.cid, req.user);
            res.status(200).json({ status: 'success', data: { id: req.params.sid } });
        } catch (err) {
            return next(err);
        }
    }
);

module.exports = router;
