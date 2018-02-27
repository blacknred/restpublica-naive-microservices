/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
const express = require('express');
const queries = require('../db/queries.js');
const validate = require('./validation');

const router = express.Router();

/* subscriptions */

router.post('/:uid/follow', validate.subscriptions,
    async (req, res, next) => {
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
    }
);

router.get('/:uid/followers', validate.subscriptions,
    async (req, res, next) => {
        const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
        try {
            const data = await queries.getFollowers(req.params.uid, req.user, offset);
            data.subscriptions.forEach(u => u.avatar = u.avatar.toString('base64'));
            res.status(200).json({
                status: 'success',
                data
            });
        } catch (err) {
            return next(err);
        }
    }
);

router.get('/:uid/following', validate.subscriptions,
    async (req, res, next) => {
        const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
        try {
            const data = await queries.getFollowing(req.params.uid, req.user, offset);
            data.subscriptions.forEach(u => u.avatar = u.avatar.toString('base64'));
            res.status(200).json({
                status: 'success',
                data
            });
        } catch (err) {
            return next(err);
        }
    }
);

router.get('/:uid/following/ids', validate.subscriptions,
    async (req, res, next) => {
        const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
        try {
            const data = await queries.getFollowingIds(req.params.uid, offset, req.user);
            res.status(200).json({
                status: 'success',
                data
            });
        } catch (err) {
            return next(err);
        }
    }
);

router.delete('/:uid/follow/:sid', validate.subscriptions,
    async (req, res, next) => {
        try {
            const data = await queries.deleteSubscription(req.params.sid, req.user);
            res.status(200).json({
                status: 'success',
                data
            });
        } catch (err) {
            return next(err);
        }
    }
);

module.exports = router;
