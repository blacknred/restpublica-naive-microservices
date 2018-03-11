/* eslint-disable consistent-return */
const express = require('express');
const queries = require('../db/queries.js');
const { tags } = require('./validation');

const router = express.Router();

/* tags */

router.get('/tags', tags, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    const query = req.query.query.toLowerCase() || null;
    let data;
    try {
        if (query) data = await queries.getSearchedTags(query, offset);
        else data = await queries.getTrendingTags(offset);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
