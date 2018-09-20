/* eslint-disable consistent-return */
/* eslint-disable no-throw-literal */

const express = require('express');

const {
    comments,
    commentsLikes
} = require('./validation');
const Post = require('../db/models/Post');
const Comment = require('../db/models/Comment');
const { ensureAuthenticated } = require('../auth');

const router = express.Router();

/* comments likes */

router
    .post('/:pid/comments/cid/like', ensureAuthenticated, commentsLikes,
        async (req, res, next) => {
            const newCommentLike = {
                comment_id: req.params.cid,
                user_id: req.user,
            };
            try {
                const post = await Post.isExists(req.params.pid);
                if (!post) throw { status: 404, message: 'Post not found' };
                const comment = await Comment.isExists(req.params.cid);
                if (!comment) throw { status: 404, message: 'Comment not found' };
                const data = await Comment.createLike(newCommentLike);
                res.status(200).json({ status: 'success', data });
            } catch (err) {
                return next(err);
            }
        }
    )
    .delete('/:pid/comments/:cid/like', ensureAuthenticated, commentsLikes,
        async (req, res, next) => {
            try {
                const post = await Post.isExists(req.params.pid);
                if (!post) throw { status: 404, message: 'Post not found' };
                const comment = await Comment.isExists(req.params.cid);
                if (!comment) throw { status: 404, message: 'Comment not found' };
                const data = await Comment.deleteLike(req.params.cid, req.user);
                if (!data) throw { status: 404, message: 'Like not found' };
                res.status(200).json({ status: 'success', data });
            } catch (err) {
                return next(err);
            }
        }
    )

    /* comments */

    .post('/:pid/comments', ensureAuthenticated, comments,
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
    )
    .get('/:pid/comments', comments, async (req, res, next) => {
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
    })
    .put('/:pid/comments/:cid', ensureAuthenticated, comments,
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
    )
    .delete('/:pid/comments/:cid', ensureAuthenticated, comments,
        async (req, res, next) => {
            try {
                const post = await Post.isExists(req.params.pid);
                if (!post) throw { status: 404, message: 'Post not found' };
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
