/* eslint-disable consistent-return */
/* eslint-disable no-throw-literal */

const express = require('express');
const Comment = require('../db/models/Comment');
const Post = require('../db/models/Post');
const { comments } = require('./validation');
const { ensureAuthenticated } = require('../auth');

const router = express.Router();

/* comments */

router.post('/:pid/comments', ensureAuthenticated, comments,
    async (req, res, next) => {
        const newComment = {
            post_id: req.params.pid,
            user_id: req.user,
            body: req.body.comment
        };
        try {
            const post = await Post.isExists(req.params.pid);
            if (!post) throw { status: 404, message: 'Post not found' };
            if (!post.commentable) throw { status: 403, message: 'Permission denied' };
            const data = await Comment.create(newComment);
            console.log(data);
            res.status(200).json({ status: 'success', data });
        } catch (err) {
            return next(err);
        }
    }
);

router.get('/:pid/comments', comments, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ?
        --req.query.offset : 0;
    const reduced = req.useragent.isMobile;
    try {
        const post = await Post.isExists(req.params.pid);
        if (!post) throw { status: 404, message: 'Post not found' };
        if (!post.commentable) throw { status: 403, message: 'Permission denied' };
        if (post.archived && post.author_id !== req.user) {
            throw { status: 403, message: 'Permission denied' };
        }
        const data = await Comment.getAll({ postId: req.params.pid, offset, reduced });
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.put('/:pid/comments/:cid', ensureAuthenticated, comments,
    async (req, res, next) => {
        const newComment = { body: req.body.comment };
        try {
            const comment = await Comment.isExists(req.params.cid);
            if (!comment) throw { status: 404, message: 'Comment not found' };
            if (comment.user_id !== req.user) {
                throw { status: 403, message: 'Permission denied' };
            }
            const data = await Comment.update(
                { newComment, commentId: req.params.cid, userId: req.user });
            res.status(200).json({ status: 'success', data });
        } catch (err) {
            return next(err);
        }
    }
);

router.delete('/:pid/comments/:cid', ensureAuthenticated, comments,
    async (req, res, next) => {
        try {
            const comment = await Comment.isExists(req.params.cid);
            if (!comment) throw { status: 404, message: 'Comment not found' };
            if (comment.user_id !== req.user) {
                throw { status: 403, message: 'Permission denied' };
            }
            await Comment.deleteOne(req.params.cid, req.user);
            res.status(200).json({ status: 'success', data: { id: req.params.cid } });
        } catch (err) {
            return next(err);
        }
    }
);

module.exports = router;
