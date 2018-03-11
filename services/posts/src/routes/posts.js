/* eslint-disable consistent-return */
/* eslint-disable no-case-declarations */
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
        commentable: req.body.commentable,
        archived: req.body.archived,
        community_id: req.body.communityId,
        description: req.body.description
    };
    try {
        const post = await queries.createPost(newPost);
        switch (req.body.type) {
            case 'file':
                Object.keys(req.files).map(async (fileKey) => {
                    const file = req.files[fileKey];
                    if (file.truncated) throw new Error('File is over the size limit: 10mB');
                    let mime;
                    let fileBuffer;
                    let thumbBuffer;
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
