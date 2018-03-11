/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
const express = require('express');
const queries = require('../db/queries.js');
const { bans } = require('./validation');

const router = express.Router();

/* bans */

router.post('/:cid/ban', bans, async (req, res, next) => {
    const newBan = {
        community_id: req.body.id,
        user_id: req.user,
        end_date: req.body.endDate
    };
    try {
        const data = await queries.createBan(newBan);
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
        const data = await queries.getBans(communityId, offset);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
