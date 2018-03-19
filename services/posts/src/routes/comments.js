/* eslint-disable consistent-return */
/* eslint-disable no-throw-literal */

const express = require('express');
const Comment = require('../db/models/Comment');
const { comments } = require('./validation');
const { ensureAuthenticated } = require('../auth');

const router = express.Router();

/* comments */

router.post('/:pid/comments', ensureAuthenticated, comments, async (req, res, next) => {
    const newComment = {
        post_id: req.params.pid,
        user_id: req.user,
        body: req.body.comment
    };
    try {
        const isCommentable = await Comment.isPostCommentable(req.params.pid);
        if (!isCommentable) throw { status: 403, message: 'Permission denied' };
        const post = await Comment.findPostById(req.params.pid);
        if (!post) throw { status: 404, message: 'Post not found' };
        const data = await Comment.addPostComment(newComment);
        res.status(200).json({ status: 'success', data: data[0] });
    } catch (err) {
        return next(err);
    }
});

router.get('/:pid/comments', comments, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    try {
        const isCommentable = await Comment.isPostCommentable(req.params.pid);
        if (!isCommentable) throw { status: 403, message: 'Permission denied' };
        const post = await Comment.findPostById(req.params.pid);
        if (!post) throw { status: 404, message: 'Post not found' };
        const data = await Comment.getPostComments(req.params.pid, offset);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.put('/:pid/comments/:cid', ensureAuthenticated, comments, async (req, res, next) => {
    const newComment = { body: req.body.comment };
    try {
        const comment = await Comment.findCommentById(req.params.cid);
        if (!comment) throw { status: 404, message: 'Comment not found' };
        if (comment.user_id !== req.user) throw { status: 403, message: 'Permission denied' };
        const data = await Comment.updatePostComment(newComment, req.params.cid, req.user);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:pid/comments/:cid', ensureAuthenticated, comments, async (req, res, next) => {
    try {
        const comment = await Comment.findCommentById(req.params.cid);
        if (!comment) throw { status: 404, message: 'Comment not found' };
        if (comment.user_id !== req.user) throw { status: 403, message: 'Permission denied' };
        await Comment.deletePostComment(req.params.cid, req.user);
        res.status(200).json({ status: 'success', data: { id: req.params.cid } });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
