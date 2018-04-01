/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable no-throw-literal */

const express = require('express');
const User = require('../db/models/User');
const Subscription = require('../db/models/Subscription');
const { subscriptions } = require('./validation');
const { ensureAuthenticated } = require('../auth');

const router = express.Router();

/* subscriptions */

router.post('/:uid/follow', ensureAuthenticated, subscriptions,
    async (req, res, next) => {
        const newSubscription = {
            user_id: req.params.uid,
            sub_user_id: req.user
        };
        try {
            const user = await User.isExist({ id: req.params.uid });
            if (!user) throw { status: 404, message: 'Profile not found' };
            const data = await Subscription.create(newSubscription);
            res.status(200).json({ status: 'success', data });
        } catch (err) {
            return next(err);
        }
    }
);

router.get('/:uid/followers', ensureAuthenticated, subscriptions,
    async (req, res, next) => {
        const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ?
            --req.query.offset : 0;
        const reduced = req.useragent.isMobile || req.query.reduced;
        try {
            const user = await User.isExist({ id: req.params.uid });
            if (!user) throw { status: 404, message: 'Profile not found' };
            const data = await Subscription.getAllFollowers(
                { profileId: req.params.uid, userId: req.user, offset, reduced });
            data.subscriptions.forEach(u => u.avatar = u.avatar.toString('base64'));
            res.status(200).json({ status: 'success', data });
        } catch (err) {
            return next(err);
        }
    }
);

router.get('/:uid/following', ensureAuthenticated, subscriptions,
    async (req, res, next) => {
        const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ?
            --req.query.offset : 0;
        const reduced = req.useragent.isMobile || req.query.reduced;
        try {
            const user = await User.isExist({ id: req.params.uid });
            if (!user) throw { status: 404, message: 'Profile not found' };
            const data = await Subscription.getAllFollowing(
                { profileId: req.params.uid, userId: req.user, offset, reduced });
            data.subscriptions.forEach(u => u.avatar = u.avatar.toString('base64'));
            res.status(200).json({ status: 'success', data });
        } catch (err) {
            return next(err);
        }
    }
);

router.get('/:uid/dashboard', ensureAuthenticated, subscriptions,
    async (req, res, next) => {
        try {
            const data = await Subscription.getAllDashboard(req.user);
            res.status(200).json({ status: 'success', data });
        } catch (err) {
            return next(err);
        }
    }
);

router.delete('/:uid/follow/:sid', ensureAuthenticated, subscriptions,
    async (req, res, next) => {
        try {
            const sub = await Subscription.isExist(req.params.sid);
            if (!sub) throw { status: 404, message: 'Subscription not found' };
            if (sub.sub_user_id !== req.user) {
                throw { status: 403, message: 'Permission denied' };
            }
            await Subscription.deleteOne(req.params.sid, req.user);
            res.status(200).json({ status: 'success', data: { id: req.params.sid } });
        } catch (err) {
            return next(err);
        }
    }
);

module.exports = router;
