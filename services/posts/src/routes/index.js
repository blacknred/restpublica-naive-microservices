/* eslint-disable consistent-return */
const express = require('express');
const queries = require('../db/queries.js');
const helpers = require('./_helpers');
const dbHelpers = require('../db/_helpers');
const validate = require('./validation');

const router = express.Router();

/* posts */

router.post('/posts', validate.post, async (req, res, next) => {
    const newPost = {
        slug: dbHelpers.genSlug(),
        author_id: req.user,
        type: req.body.type,
        commentable: req.body.commentable,
        archived: req.body.archived,
        community_id: req.body.communityId,
        description: req.body.description
    };
    try {
        const post = await queries.createPost(newPost);
        /* eslint-disable */
        switch (req.body.type) {
            case 'file':
                Object.keys(req.files).map(async (fileKey) => {
                    const file = req.files[fileKey]
                    if (file.truncated) throw new Error('File is over the size limit: 10mB');
                    let mine, fileBuffer, thumbBuffer;
                    switch (req.body.fileType) {
                        case 'img':
                            mime = 'image/jpg';
                            fileBuffer = helpers.imageToJpg(file.data);
                            thumbBuffer = await helpers.imageThumb(fileBuffer);
                            break;
                        case 'gif':
                            mime = 'image/gif';
                            fileBuffer = file.data;
                            thumbBuffer = await helpers.imageThumb(fileBuffer);
                            break;
                        case 'video':
                            mime = 'video/mp4';
                            fileBuffer = helpers.videoToMp4(file.data);
                            thumbBuffer = await helpers.videoThumb(fileBuffer);
                            break;
                        default:
                    }
                    const [filePath, thumbPath] =
                        await helpers.fileToStorage(file.name, mime, fileBuffer, thumbBuffer);
                    const fileObj = {
                        post_id: post.id,
                        mime,
                        file: filePath,
                        thumb: thumbPath
                    };
                    await queries.addFiles(fileObj);
                });
                break;
            case 'link':
                const newLink = {
                    post_id: post.id,
                    type: req.body.linkType,
                    link: req.body.linkUrl,
                    src: req.body.linkSrc,
                    title: req.body.linkTitle
                };
                if (req.body.linkThumb !== null) {
                    const thumbBuffer = await helpers.fetchImageUrl(req.body.linkThumb);
                    const thumbBufferJpg = await helpers.imageToJpg(thumbBuffer);
                    newLink.thumb = await helpers.imageThumb(thumbBufferJpg);                
                }
                await queries.addLink(newLink);
                break;
            case 'poll':
                const newPoll = {
                    post_id: post.id,
                    subject: req.body.pollSubject,
                    ends_at: req.body.pollendsAt
                };
                const addedPoll = await queries.addPoll(newPoll);
                const pollOptions = Object.keys(JSON.parse(req.body.pollOptions));
                pollOptions.forEach(async (opt) => {
                    const newPollOption = {
                        poll_id: addedPoll.id,
                        option: pollOptions[opt]
                    };
                    if (req.files[opt]) {
                        const thumbBuffer = await helpers.imageToJpg(req.files[opt].data);
                        newPollOption.img = await helpers.imageThumb(thumbBuffer);
                    }
                    await queries.addPollOption(newPollOption);
                });
                break;
            default:
        }
        /* eslint-enable */
        if (req.body.tags !== null) {
            const tags = req.body.tags.split(/^$|#[0-9a-zA-Z]+/g);
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

router.get('/posts', validate.posts, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    const tag = req.query.tag.toLowerCase() || null;
    const query = req.query.query.toLowerCase() || null;
    const profiles = req.query.profiles.split(',') || null;
    const comms = req.query.communities.split(',') || null;
    let data;
    try {
        if (query) data = await queries.getSearchedPosts(query, offset, req.user);
        else if (tag) data = await queries.getPostsByTag(tag, offset, req.user);
        else if (profiles) data = await queries.getProfilesPosts(profiles, offset, req.user);
        else if (comms) data = await queries.getCommunitiesPosts(comms, offset, req.user);
        else data = await queries.getTrendingPosts(offset, req.user);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/posts/count', validate.posts, async (req, res, next) => {
    const community = req.query.community || null;
    const profile = req.query.profile || req.user;
    let data;
    try {
        if (community) data = await queries.getCommunityPostsCount(community);
        else data = await queries.getProfilePostsCount(profile);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/posts/:slug', validate.post, async (req, res, next) => {
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

router.put('/posts/:pid', validate.post, async (req, res, next) => {
    const updatedPost = {
        post_id: req.params.pid,
        description: req.body.description
    };
    try {
        const data = await queries.updatePost(updatedPost, req.user);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/posts/:pid', validate.post, async (req, res, next) => {
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

/* comments */

router.post('/posts/:pid/comments', validate.comments, async (req, res, next) => {
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

router.get('/posts/:pid/comments', validate.comments, async (req, res, next) => {
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

router.put('/posts/:pid/comment/:cid', validate.comments, async (req, res, next) => {
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

router.delete('/posts/:pid/comment/:cid', validate.comments, async (req, res, next) => {
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

/* likes */

router.post('/posts/:pid/likes', validate.likes, async (req, res, next) => {
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

router.get('/posts/:pid/likes', validate.likes, async (req, res, next) => {
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

router.delete('/posts/:pid/likes/:lid', validate.likes, async (req, res, next) => {
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

/* tags */

router.get('/tags', validate.tags, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    const query = req.query.query.toLowerCase() || null;
    let data;
    try {
        if (query) data = await queries.getSearchedTags(query, offset);
        else data = await queries.getTrendingTags(offset);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
