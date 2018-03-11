/* eslint-disable consistent-return */
const express = require('express');
const queries = require('../db/queries.js');
const { likes } = require('./validation');

const router = express.Router();

/* likes */

router.post('/posts/:pid/likes', likes, async (req, res, next) => {
    const newLike = {
        post_id: req.body.id,
        user_id: req.user
    };
    try {
        const data = await queries.createPostLike(newLike);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/posts/:pid/likes', likes, async (req, res, next) => {
    const pid = req.params.pid;
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    try {
        const data = await queries.getPostLikes(pid, req.user, offset);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/posts/:pid/likes/:lid', likes, async (req, res, next) => {
    const lid = req.params.lid;
    try {
        const data = await queries.deletePostLike(lid, req.user);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
