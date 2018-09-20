/* eslint-disable consistent-return */
/* eslint-disable no-throw-literal */

const express = require('express');

const Ban = require('../db/models/Ban');
const { bans } = require('./validation');
const { ensureAuthenticated } = require('../auth');
const Community = require('../db/models/Community');

const router = express.Router();

/* bans */

router.post('/:cid/ban', ensureAuthenticated, bans, async (req, res, next) => {
    const newBan = {
        community_id: req.params.cid,
        user_id: req.user,
        end_date: req.body.end_date
    };
    try {
        const com = await Community.isExist({ id: newBan.community_id });
        if (!com) throw { status: 404, message: 'Communuty not found' };
        if (com.admin_id !== req.user) throw { status: 404, message: 'Permission denied' };
        const data = await Ban.createBan(newBan);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.get('/:cid/bans', ensureAuthenticated, bans, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ?
        --req.query.offset : 0;
    const reduced = req.useragent.isMobile || req.query.reduced || false;
    try {
        const com = await Community.isExist({ id: req.params.cid });
        if (!com) throw { status: 404, message: 'Communuty not found' };
        if (com.admin_id !== req.user) throw { status: 404, message: 'Permission denied' };
        const data = await Ban.getAll({ communityId: req.params.cid, offset, reduced });
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
