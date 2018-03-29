/* eslint-disable consistent-return */
/* eslint-disable no-case-declarations */
/* eslint-disable no-throw-literal */
const express = require('express');
const url = require('url');
const Post = require('../db/models/Post');
const Tag = require('../db/models/Tag');
const { deleteStorageFiles } = require('./_helpers');
const dbHelpers = require('../db/_helpers');
const { posts } = require('./validation');
const { ensureAuthenticated } = require('../auth');

const router = express.Router();

/* posts */

router.post('/', ensureAuthenticated, posts, async (req, res, next) => {
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
        const post = await Post.create(newPost);
        switch (req.body.type) {
            case 'file':
                const mimes = {
                    img: 'image/jpg',
                    gif: 'image/gif',
                    video: 'video/mp4'
                };
                const fileObj = {
                    post_id: post[0].id,
                    mime: mimes[req.body.fileType],
                    file: req.body.fileUrl,
                    thumb: req.body.fileThumbUrl
                };
                await Post.addFiles(fileObj);
                break;
            case 'link':
                const newLink = {
                    post_id: post[0].id,
                    type: req.body.linkType,
                    link: req.body.linkUrl,
                    src: url.parse(req.body.linkUrl).hostname,
                    title: req.body.linkTitle || null,
                    thumb: req.body.linkThumb || null
                };
                await Post.addLink(newLink);
                break;
            case 'poll':
                const newPoll = {
                    post_id: post[0].id,
                    subject: req.body.pollSubject,
                    ends_at: req.body.pollEndsAt
                };
                const addedPoll = await Post.addPoll(newPoll);
                const pollOptions = JSON.parse(req.body.pollOptions);
                pollOptions.forEach(async (opt) => {
                    const newPollOption = {
                        poll_id: addedPoll[0].id,
                        option: opt
                    };
                    await Post.addPollOption(newPollOption);
                });
                break;
            default:
        }
        if (req.body.tags) {
            const tags = req.body.tags.split(',');
            tags.forEach(async (tag) => {
                const tagId = await Tag.create(tag);
                await Tag.addOneToPost(tagId, post[0].id);
            });
        }
        res.status(200).json({ status: 'success', data: post[0] });
    } catch (err) {
        return next(err);
    }
});

router.get('/', posts, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ?
        --req.query.offset : 0;
    const tag = req.query.tag ? req.query.tag.toLowerCase() : null;
    const query = req.query.q ? req.query.q.toLowerCase() : null;
    const profile = req.query.profile || null;
    const community = req.query.community || null;
    const profiles = req.query.profiles ? req.query.profiles.split(',') : null;
    const communities = req.query.communities ? req.query.communities.split(',') : null;
    const mode = req.query.mode || null;
    const dashboard = req.query.dashboard || null;
    const reduced = req.useragent.isMobile || req.query.reduced;
    let data;
    try {
        if (query) data = await Post.getAllSearched(query, req.user, offset, reduced);
        else if (tag) data = await Post.getAllByTag(tag, req.user, offset, reduced);
        else if (profile) {
            switch (mode) {
                case 'count': data = await Post.getAllCountByProfile(profile, req.user); break;
                default: data = await Post.getAllByProfile(profile, req.user, offset, reduced);
            }
        } else if (community) {
            switch (mode) {
                case 'count': data = await Post.getAllCountByCommunity(community); break;
                default: data = await Post.getAllByCommunity(community, req.user, offset, reduced);
            }
        } else if (dashboard) {
            data = await Post.getAllDashboard(profiles, communities, req.user, offset, reduced);
        } else data = await Post.getAllTrending(req.user, offset, reduced);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.get('/:slug', posts, async (req, res, next) => {
    try {
        const data = await Post.getOne(req.params.slug, req.user);
        if (!data) throw { status: 404, message: 'Post not found' };
        res.json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.put('/:pid', ensureAuthenticated, posts, async (req, res, next) => {
    // commentable archived description ?communityId ?tags
    const updatedPost = {
        community_id: req.body.communityId || null,
        commentable: req.body.commentable,
        archived: req.body.archived,
        description: req.body.description
    };
    try {
        const post = await Post.isExists(req.params.pid);
        if (!post) throw { status: 404, message: 'Post not found' };
        if (post.author_id !== req.user) throw { status: 403, message: 'Permission denied' };
        const data = await Post.update(updatedPost, req.params.pid, req.user);
        if (req.body.tags) {
            const tags = req.body.tags.split(',');
            await Tag.deleteAllFromPost(data[0].id);
            tags.forEach(async (tag) => {
                const tagId = await Tag.create(tag);
                await Tag.addOneToPost(tagId, data[0].id);
            });
        }
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:pid', ensureAuthenticated, posts, async (req, res, next) => {
    try {
        const post = await Post.isExists(req.params.pid);
        if (!post) throw { status: 404, message: 'Post not found' };
        if (post.author_id !== req.user) throw { status: 403, message: 'Permission denied' };
        const filesToDelete = await Post.deleteOne(req.params.pid, req.user);
        if (filesToDelete) await deleteStorageFiles(filesToDelete);
        res.status(200).json({ status: 'success', data: { id: req.params.pid } });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
