/* eslint-disable consistent-return */
/* eslint-disable no-throw-literal */

const express = require('express');
const Like = require('../db/models/Like');
const Post = require('../db/models/Post');
const { likes } = require('./validation');
const { ensureAuthenticated } = require('../auth');

const router = express.Router();

/* likes */

router.post('/:pid/likes', ensureAuthenticated, likes,
    async (req, res, next) => {
        const newLike = {
            post_id: req.params.pid,
            user_id: req.user
        };
        try {
            const post = await Post.isExists(req.params.pid);
            if (!post) throw { status: 404, message: 'Post not found' };
            const data = await Like.create(newLike);
            res.status(200).json({ status: 'success', data });
        } catch (err) {
            return next(err);
        }
    }
);

router.get('/:pid/likes', ensureAuthenticated, likes, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ?
        --req.query.offset : 0;
    const reduced = req.useragent.isMobile;
    try {
        const post = await Post.isExists(req.params.pid);
        if (!post) throw { status: 404, message: 'Post not found' };
        const data = await Like.getAll(req.params.pid, offset, reduced);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:pid/likes', ensureAuthenticated, likes, async (req, res, next) => {
    try {
        const post = await Post.isExists(req.params.pid);
        if (!post) throw { status: 404, message: 'Post not found' };
        const data = await Like.deleteOne(req.params.pid, req.user);
        if (!data) throw { status: 404, message: 'Like not found' };
        res.status(200).json({ status: 'success', data: { id: req.params.pid } });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
