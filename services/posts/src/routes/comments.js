/* eslint-disable consistent-return */
const express = require('express');
const queries = require('../db/queries.js');
const { comments } = require('./validation');

const router = express.Router();

/* comments */

router.post('/posts/:pid/comments', comments, async (req, res, next) => {
    const newComment = {
        post_id: req.body.id,
        user_id: req.user,
        comment: req.body.comment
    };
    try {
        const data = await queries.createPostComment(newComment);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/posts/:pid/comments', comments, async (req, res, next) => {
    const pid = req.params.pid;
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    try {
        const data = await queries.getPostComments(pid, offset);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.put('/posts/:pid/comment/:cid', comments, async (req, res, next) => {
    const cid = req.params.cid;
    const newComment = {
        comment: req.body.comment
    };
    try {
        const data = await queries.updatePostComment(cid, req.user, newComment);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/posts/:pid/comment/:cid', comments, async (req, res, next) => {
    const cid = req.params.cid;
    try {
        const data = await queries.deletePostComment(cid, req.user);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
