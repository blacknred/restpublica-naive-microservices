/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
const express = require('express');
const queries = require('../db/queries.js');
const { subscriptions } = require('./validation');

const router = express.Router();

/* subscriptions */

router.post('/:uid/follow', subscriptions, async (req, res, next) => {
    const newSubscription = {
        user_id: req.body.id,
        sub_user_id: req.user
    };
    try {
        const data = await queries.createSubscription(newSubscription);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/:uid/followers', subscriptions, async (req, res, next) => {
    const userId = req.params.uid;
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    try {
        const data = await queries.getFollowers(userId, req.user, offset);
        data.subscriptions.forEach(u => u.avatar = u.avatar.toString('base64'));
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/:uid/following', subscriptions, async (req, res, next) => {
    const userId = req.params.uid;
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    const lim = req.query.lim;
    try {
        const data = await queries.getFollowing(userId, req.user, lim, offset);
        data.subscriptions.forEach(u => u.avatar = u.avatar.toString('base64'));
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:uid/follow/:sid', subscriptions, async (req, res, next) => {
    const subscriptionId = req.params.sid;
    try {
        const data = await queries.deleteSubscription(subscriptionId, req.user);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
