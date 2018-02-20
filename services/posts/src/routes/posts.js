/* eslint-disable consistent-return */
const express = require('express');
const postsQueries = require('../db/queries.js');
const helpers = require('./_helpers');
const dbHelpers = require('../db/_helpers');
const validate = require('./validation');

const router = express.Router();


/* status */

router.get('/ping', (req, res) => {
    res.send('pong');
});

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
        const post = await postsQueries.createPost(newPost);
        // if (data.name) throw new Error(data.detail || data.message);
        switch (req.body.type) {
            /* eslint-disable */
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
                    await postsQueries.addFiles(fileObj);
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
                await postsQueries.addLink(newLink);
                break;
            case 'poll':
                const newPoll = {
                    post_id: post.id,
                    subject: req.body.pollSubject,
                    ends_at: req.body.pollendsAt
                };
                const addedPoll = await postsQueries.addPoll(newPoll);
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
                    await postsQueries.addPollOption(newPollOption);
                });
                break;
            default:
        }
        if (req.body.tags !== null) {
            const tags = req.body.tags.split(/^$|#[0-9a-zA-Z]+/g);
            tags.forEach(async (tag) => {
                const tagId = await postsQueries.saveTag(tag);
                await postsQueries.addTagToPost(tagId, post.id);
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
        if (query) data = await postsQueries.getSearchedPosts(query, offset, req.user);
        else if (tag) data = await postsQueries.getPostsByTag(tag, offset, req.user);
        else if (profiles) data = await postsQueries.getProfilesPosts(profiles, offset, req.user);
        else if (comms) data = await postsQueries.getCommunitiesPosts(comms, offset, req.user);
        else data = await postsQueries.getTrendingPosts(offset, req.user);
        // if (data.name) throw new Error(data.detail || data.message);
        // const sPosts = await helpers.getUsersPosts(sUsers.users.map(u => u.user_id));
        // if (sUsers.count > 0 && !sPosts) throw new Error(`Users posts not fetched`);
        // // eslint-disable-next-line
        // sUsers.users.forEach(x => x.posts = sPosts.find(y => y.user_id == x.user_id));
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
        const data = await postsQueries.getPost(req.params.slug, req.user);
        // if (data.name) throw new Error(data.detail || data.message);
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
        const data = await postsQueries.updatePost(updatedPost, req.user);
        // if (data.name) throw new Error(data.detail || data.message);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/posts/:pid', validate.post, async (req, res, next) => {
    try {
        const data = await postsQueries.deletePost(req.params.pid, req.user);
        // if (data.name) throw new Error(data.detail || data.message);
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
        const data = await postsQueries.createPostComment(newComment);
        // if (data.name) throw new Error(data.detail || data.message);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/posts/:pid/comments', validate.comments, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    try {
        const data = await postsQueries.getPostComments(req.params.pid, offset);
        // if (communityData.name) throw new Error(communityData.detail || communityData.message);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.put('/posts/:pid/comment/:cid', validate.comments, async (req, res, next) => {
    const newComment = {
        comment: req.body.comment
    };
    try {
        const data = await postsQueries.updatePostComment(req.params.cid, req.user, newComment);
        // if (data.name) throw new Error(data.detail || data.message);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/posts/:pid/comment/:cid', validate.comments, async (req, res, next) => {
    try {
        const data = await postsQueries.deletePostComment(req.params.cid, req.user);
        // if (data.name) throw new Error(data.detail || data.message);
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
        const data = await postsQueries.createPostLike(newLike);
        // if (data.name) throw new Error(data.detail || data.message);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/posts/:pid/likes', validate.likes, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    try {
        const data = await postsQueries.getPostLikes(req.params.pid, req.user, offset);
        // if (communityData.name) throw new Error(communityData.detail || communityData.message);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/posts/:pid/likes/:lid', validate.likes, async (req, res, next) => {
    try {
        const data = await postsQueries.deletePostLike(req.params.lid, req.user);
        // if (data.name) throw new Error(data.detail || data.message);
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
        if (query) data = await postsQueries.getSearchedTags(query, offset);
        else data = await postsQueries.getTrendingTags(offset);
        // if (data.name) throw new Error(data.detail || data.message);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
