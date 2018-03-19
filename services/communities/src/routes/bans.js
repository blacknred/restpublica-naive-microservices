/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */

const express = require('express');
const moment = require('moment');
const Ban = require('../db/models/Ban');
const { bans } = require('./validation');

const router = express.Router();

/* bans */

router.post('/:cid/ban', bans, async (req, res, next) => {
    const newBan = {
        community_id: req.body.id,
        user_id: req.user
    };
    if (req.body.endDate && moment(req.body.endDate).isValid()) {
        newBan.end_date = req.body.endDate;
    }
    try {
        const com = await Ban.findCommunityById(newBan.community_id);
        if (com.admin_id !== req.user) throw new Error(`Access is restricted`);
        const data = await Ban.createBan(newBan);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/:cid/bans', bans, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    const communityId = req.params.cid;
    try {
        const com = await Ban.findCommunityById(communityId);
        if (com.admin_id !== req.user) throw new Error(`Access is restricted`);
        const data = await Ban.getBans(communityId, offset);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
