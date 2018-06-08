/* eslint-disable consistent-return */
/* eslint-disable no-throw-literal */

const express = require('express');
const Vote = require('../db/models/Vote');
const Post = require('../db/models/Post');
const { votes } = require('./validation');
const { ensureAuthenticated } = require('../auth');

const router = express.Router();

/* votes */

router.post('/:pid/votes', ensureAuthenticated, votes,
    async (req, res, next) => {
        const newVote = {
            option_id: req.body.optionId,
            user_id: req.body.userId
        };
        try {
            const post = await Post.isExists(req.params.pid);
            if (!post) throw { status: 404, message: 'Post not found' };
            await Vote.deleteOne(req.params.pid, req.user);
            const data = await Vote.create(newVote);
            res.status(200).json({ status: 'success', data });
        } catch (err) {
            return next(err);
        }
    }
);

router.get('/:pid/votes', ensureAuthenticated, votes, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ?
        --req.query.offset : 0;
    const reduced = req.useragent.isMobile;
    try {
        const post = await Post.isExists(req.params.pid);
        if (!post) throw { status: 404, message: 'Post not found' };
        const data = await Vote.getAll({ postId: req.params.pid, offset, reduced });
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:pid/votes/:oid', ensureAuthenticated, votes, async (req, res, next) => {
    try {
        const post = await Post.isExists(req.params.pid);
        if (!post) throw { status: 404, message: 'Post not found' };
        const data = await Vote.deleteOne(req.params.pid, req.user);
        if (!data) throw { status: 404, message: 'Vote not found' };
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
