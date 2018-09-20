/* eslint-disable consistent-return */
/* eslint-disable no-throw-literal */

const express = require('express');

const { subscriptions } = require('./validation');
const { ensureAuthenticated } = require('../auth');
const Community = require('../db/models/Community');
const Subscription = require('../db/models/Subscription');

const router = express.Router();

/* subscriptions */

router
    .post('/:cid/follow', ensureAuthenticated, subscriptions,
        async (req, res, next) => {
            const newSubscription = {
                community_id: req.params.cid,
                user_id: req.user,
                type: req.type || 'participant'
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
    )
    .get('/:cid/participants', ensureAuthenticated, subscriptions,
        async (req, res, next) => {
            const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ?
                --req.query.offset : 0;
            const reduced = req.useragent.isMobile || req.query.reduced || false;
            const pending = req.query.pending || null;
            try {
                const community = await Community.isExist({ id: req.params.cid });
                if (!community) throw { status: 404, message: 'Community not found' };
                const data = await Subscription.getAllParticipants({
                    communityId: req.params.cid,
                    userId: req.user,
                    adminId: community.admin_id,
                    pending,
                    offset,
                    reduced
                });
                res.status(200).json({ status: 'success', data });
            } catch (err) {
                return next(err);
            }
        }
    )
    .get('/:cid/moderators', ensureAuthenticated, subscriptions,
        async (req, res, next) => {
            const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ?
                --req.query.offset : 0;
            const reduced = req.useragent.isMobile || req.query.reduced || false;
            try {
                const community = await Community.isExist({ id: req.params.cid });
                if (!community) throw { status: 404, message: 'Community not found' };
                const data = await Subscription.getAllModerators({
                    communityId: req.params.cid,
                    offset,
                    reduced
                });
                const { count } = data;
                data.count = parseInt(count, 10) + 1;
                if (offset === 0) {
                    data.profiles.push({ subscription_id: null, user_id: community.admin_id });
                }
                res.status(200).json({ status: 'success', data });
            } catch (err) {
                return next(err);
            }
        }
    )
    .delete('/:cid/follow/:sid', ensureAuthenticated, subscriptions,
        async (req, res, next) => {
            try {
                const sub = await Subscription.isExist(req.params.sid);
                if (!sub) throw { status: 404, message: 'Subscription not found' };
                if (sub.user_id !== req.user) {
                    throw { status: 403, message: 'Permission denied' };
                }
                await Subscription.deleteOne({
                    subscriptionId: req.params.sid,
                    communityId: req.params.cid,
                    userId: req.user
                });
                res.status(200).json({ status: 'success', data: { id: req.params.sid } });
            } catch (err) {
                return next(err);
            }
        }
    );

module.exports = router;
