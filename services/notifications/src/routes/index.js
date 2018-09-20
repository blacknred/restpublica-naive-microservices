/* eslint-disable consistent-return */
/* eslint-disable no-throw-literal */

const express = require('express');
const { ensureAuthenticated } = require('../auth');
const { notificationsValidation } = require('./validation');
const Notifications = require('../db/controllers/notifications');

const router = express.Router();

router
    .get('/v1/ping', res => res.status(200).send('pong'))

    /* notifications */

    .post('/', ensureAuthenticated, notificationsValidation,
        async (req, res, next) => {
            const newNotification = {
                type: req.body.type,
                originId: req.body.originId,
                targetId: req.user,
            };
            try {
                const data = await Notifications.create(newNotification);
                res.status(200).json({ status: 'success', data });
            } catch (err) {
                return next(err);
            }
        }
    )

    .get('/', ensureAuthenticated, async (req, res, next) => {
        try {
            const data = await Notifications.getAll(req.user);
            res.status(200).json({ status: 'success', data });
        } catch (err) {
            return next(err);
        }
    })

    .delete('/', ensureAuthenticated, async (req, res, next) => {
        try {
            await Notifications.deleteAll(req.user);
            res.status(200).json({ status: 'success' });
        } catch (err) {
            return next(err);
        }
    })

    .delete('/:nid', ensureAuthenticated, notificationsValidation,
        async (req, res, next) => {
            try {
                const data = await Notifications.deleteOne(req.params.nid, req.user);
                res.status(200).json({ status: 'success', data });
            } catch (err) {
                return next(err);
            }
        }
    );


module.exports = router;
