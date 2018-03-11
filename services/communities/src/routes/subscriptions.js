/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
const express = require('express');
const queries = require('../db/queries.js');
const { subscriptions } = require('./validation');

const router = express.Router();

/* subscriptions */

router.post('/:cid/follow', subscriptions, async (req, res, next) => {
    const newSubscription = {
        community_id: req.body.id,
        user_id: req.user
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

router.get('/:cid/followers', subscriptions, async (req, res, next) => {
    const id = req.params.cid;
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    try {
        const data = await queries.getCommunityFollowers(id, req.user, offset);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:cid/follow/:sid', subscriptions, async (req, res, next) => {
    const communityId = req.params.cid;
    const id = req.params.sid;
    try {
        const data = await queries.deleteSubscription(id, communityId, req.user);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
