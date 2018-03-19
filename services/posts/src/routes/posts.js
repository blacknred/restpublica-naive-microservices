/* eslint-disable consistent-return */
/* eslint-disable no-case-declarations */
/* eslint-disable no-throw-literal */
const express = require('express');
const url = require('url');
const Post = require('../db/models/Post');
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
        const post = await Post.createPost(newPost);
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
                const tagId = await Post.saveTag(tag);
                await Post.addTagToPost(tagId, post[0].id);
            });
        }
        res.status(200).json({ status: 'success', data: post });
    } catch (err) {
        return next(err);
    }
});

router.get('/', posts, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    const tag = req.query.tag ? req.query.tag.toLowerCase() : null;
    const query = req.query.query ? req.query.query.toLowerCase() : null;
    const profiles = req.query.profiles ? req.query.profiles.split(',') : null;
    const comms = req.query.communities ? req.query.communities.split(',') : null;
    const lim = req.query.lim || null;
    const limit = req.useragent.isMobile ? 3 : null;
    let data;
    try {
        if (query) data = await Post.getSearchedPosts(query, req.user, offset);
        else if (tag) data = await Post.getPostsByTag(tag, req.user, offset);
        else if (profiles) {
            if (lim === 'count') data = await Post.getProfilesPostsCount(profiles, req.user);
            else data = await Post.getProfilesPosts(profiles, req.user, offset, limit);
        } else if (comms) {
            if (lim === 'count') data = await Post.getCommunitiesPostsCount(comms);
            else data = await Post.getCommunitiesPosts(comms, req.user, offset, limit);
        } else data = await Post.getTrendingPosts(req.user, offset);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.get('/:slug', posts, async (req, res, next) => {
    try {
        const data = await Post.getPost(req.params.slug, req.user);
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
        const post = await Post.findPostById(req.params.pid);
        if (!post) throw { status: 404, message: 'Post not found' };
        if (post.author_id !== req.user) throw { status: 403, message: 'Permission denied' };
        const data = await Post.updatePost(updatedPost, req.params.pid, req.user);
        if (req.body.tags) {
            const tags = req.body.tags.split(',');
            await Post.removeTagsFromPost(data[0].id);
            tags.forEach(async (tag) => {
                const tagId = await Post.saveTag(tag);
                await Post.addTagToPost(tagId, data[0].id);
            });
        }
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:pid', ensureAuthenticated, posts, async (req, res, next) => {
    try {
        const post = await Post.findPostById(req.params.pid);
        if (!post) throw { status: 404, message: 'Post not found' };
        if (post.author_id !== req.user) throw { status: 403, message: 'Permission denied' };
        const filesToDelete = await Post.deletePost(req.params.pid, req.user);
        if (filesToDelete) await deleteStorageFiles(filesToDelete);
        res.status(200).json({ status: 'success', data: { id: req.params.pid } });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
