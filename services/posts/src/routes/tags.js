/* eslint-disable consistent-return */

const express = require('express');
const Tag = require('../db/models/Tag');
const { tags } = require('./validation');

const router = express.Router();

/* tags */

router.get('/', tags, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ?
        --req.query.offset : 0;
    const query = req.query.q ? req.query.q.toLowerCase() : null;
    let data;
    try {
        if (query) data = await Tag.getAllSearched(query, offset);
        else data = await Tag.getAllTrending(offset);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
