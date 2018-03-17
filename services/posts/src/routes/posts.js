/* eslint-disable consistent-return */
/* eslint-disable */ // no-case-declarations */
const express = require('express');
const queries = require('../db/queries.js');
const helpers = require('./_helpers');
const dbHelpers = require('../db/_helpers');
const { posts } = require('./validation');

const router = express.Router();

/* posts */

router.post('/', posts, async (req, res, next) => {
    const newPost = {
        slug: dbHelpers.genSlug(),
        author_id: req.user,
        type: req.body.type,
        community_id: req.body.communityId || null,
        commentable: req.body.commentable,
        archived: req.body.archived,
        description: req.body.description
    };
    try {
        const post = await queries.createPost(newPost);
        switch (req.body.type) {
            case 'file':
                const mimes = {
                    img: 'image/jpg',
                    gif: 'image/gif',
                    video: 'video/mp4'
                }
                const fileObj = {
                    post_id: post.id,
                    mime: mimes[req.body.type],
                    file: req.body.fileUrl,
                    thumb: req.body.fileThumbUrl
                };
                await queries.addFiles(fileObj);
                break;
            case 'link':
                const newLink = {
                    post_id: post.id,
                    type: req.body.linkType,
                    link: req.body.linkUrl,
                    src: req.body.linkSrc,
                    title: req.body.linkTitle || null,
                    thumb: req.body.linkThumb || null
                };
                await queries.addLink(newLink);
                break;
            case 'poll':
                const newPoll = {
                    post_id: post.id,
                    subject: req.body.pollSubject,
                    ends_at: req.body.pollEndsAt
                };
                const addedPoll = await queries.addPoll(newPoll);
                const pollOptions = JSON.parse(req.body.pollOptions);
                pollOptions.forEach(async (opt) => {
                    const newPollOption = {
                        poll_id: addedPoll.id,
                        option: opt
                    };
                    await queries.addPollOption(newPollOption);
                });
                break;
            default:
        }
        if (req.body.tags) {
            const tags = req.body.tags.split(/^#[0-9a-zA-Z]+/g);
            tags.forEach(async (tag) => {
                const tagId = await queries.saveTag(tag);
                await queries.addTagToPost(tagId, post.id);
            });
        }
        res.status(200).json({
            status: 'success',
            data: post
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/', posts, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    const tag = req.query.tag.toLowerCase() || null;
    const query = req.query.query.toLowerCase() || null;
    const profiles = req.query.profiles.split(',') || null;
    const comms = req.query.communities.split(',') || null;
    const lim = req.params.lim || null;
    let data;
    try {
        if (query) data = await queries.getSearchedPosts(query, req.user, lim, offset);
        else if (tag) data = await queries.getPostsByTag(tag, req.user, lim, offset);
        else if (profiles) data = await queries.getProfilesPosts(profiles, req.user, lim, offset);
        else if (comms) data = await queries.getCommunitiesPosts(comms, req.user, lim, offset);
        else data = await queries.getTrendingPosts(req.user, lim, offset);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/:slug', posts, async (req, res, next) => {
    try {
        const data = await queries.getPost(req.params.slug, req.user);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.put('/:pid', posts, async (req, res, next) => {
    // commentable archived communityId description tags
    const updatedPost = {
        post_id: req.params.pid,
        community_id: req.body.communityId || null,
        commentable: req.body.commentable,
        archived: req.body.archived,
        description: req.body.description
    };
    try {
        const data = await queries.updatePost(updatedPost, req.user);
        if (req.body.tags) {
            const tags = req.body.tags.split(/^#[0-9a-zA-Z]+/g);
            tags.forEach(async (tag) => {
                const tagId = await queries.saveTag(tag);
                await queries.addTagToPost(tagId, post.id);
            });
        }
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:pid', posts, async (req, res, next) => {
    const pid = req.params.pid;
    try {
        const data = await queries.deletePost(pid, req.user);
        await helpers.deleteStorageFiles(data);
        res.status(200).json({
            status: 'success',
            data: req.params.pid
        });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
