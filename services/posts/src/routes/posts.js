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

/* post */

router.post('/posts', validate.post, async (req, res, next) => {
    const newPost = {
        slug: dbHelpers.genSlug(),
        author_id: req.user,
        commentable: req.body.commentable,
        archived: req.body.archived
    };
    if (req.body.communityId) newPost.community_id = req.body.communityId;
    if (req.body.description) newPost.description = req.body.description;
    try {
        const post = await postsQueries.createPost(newPost);
        // if (data.name) throw new Error(data.detail || data.message);
        switch (req.body.contentType) {
            /* eslint-disable */
            case 'imgs' || 'video':
                Object.keys(req.files).map(async (fileKey) => {
                    const file = req.files[fileKey]
                    if (file.truncated) throw new Error('file is over the size limit: 10mB');
                    let thumbBuffer;
                    if (req.body.contentType === 'img') thumbBuffer = await helpers.createImageThumb(file.data);
                    else { thumbBuffer = await helpers.createVideoThumb(file); }
                    const [filePath, thumbPath] = await helpers.saveFile(file, thumbBuffer);
                    const fileObj = {
                        post_id: post.id,
                        mime: file.mimetype,
                        file: filePath,
                        thumb: thumbPath
                    };
                    await postsQueries.addFiles(fileObj);
                });
                break;
            case 'link':
                const link = JSON.parse(req.body.link);
                // create new link
                const newLink = {
                    post_id: post.id,
                    type: link.type,
                    link: link.url
                };
                if (data.title) newLink.title = link.title;
                if (data.thumb) newLink.thumb = link.thumb;
                if (link.type === 'img') newLink.thumb = await helpers.createImageThumb(link.url);
                await postsQueries.addLink(newLink);
                break;
            case 'poll':
                const poll = JSON.parse(req.body.poll);
                // create new poll
                const newPoll = {
                    post_id: post.id,
                    subject: data.subject
                };
                if (data.endsAt) newPoll.ands_at = data.endsAt;
                const addedPoll = await postsQueries.addPoll(newPoll);
                // add poll options
                Object.keys(poll.options).map(async (objKey, i) => {
                    const newPollOption = {
                        poll_id: addedPoll.id,
                        option: poll.options[objKey]
                    };
                    if (req.files.option_[i]) newPollOption.img = req.files.option_[i].data;
                    await postsQueries.addPollOption(newPollOption);
                });
                break;
            default:
        }
        if (req.body.tags) {
            req.body.tags.forEach(async (tag) => {
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

router.put('/posts/:id', validate.post, async (req, res, next) => {
    const updatedPost = {
        post_id: req.params.Id,
        description: req.body.description
    };
    try {
        const data = await postsQueries.updatePost(req.user, updatedPost);
        // if (data.name) throw new Error(data.detail || data.message);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/posts/:id', validate.post, async (req, res, next) => {
    try {
        const data = await postsQueries.deletePost(req.params.id, req.user);
        // if (data.name) throw new Error(data.detail || data.message);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

/* comments */

router.post('/posts/:id/comments', validate.comments, async (req, res, next) => {
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

router.get('/posts/:id/comments', validate.comments, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    try {
        const data = await postsQueries.getPostComments(req.params.id, offset);
        // if (communityData.name) throw new Error(communityData.detail || communityData.message);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.put('/posts/:id/comment/:commid', validate.comments, async (req, res, next) => {
    const newComment = {
        comment: req.body.comment
    };
    try {
        const data = await postsQueries.updatePostComment(req.params.commid, req.user, newComment);
        // if (data.name) throw new Error(data.detail || data.message);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/posts/comment/:commid', validate.comments, async (req, res, next) => {
    try {
        const data = await postsQueries.deletePostComment(req.params.commid, req.user);
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

router.post('/posts/:id/likes', validate.likes, async (req, res, next) => {
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

router.get('/posts/:id/likes', validate.likes, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    try {
        const data = await postsQueries.getPostLikes(req.params.id, req.user, offset);
        // if (communityData.name) throw new Error(communityData.detail || communityData.message);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/posts/:id/likes/:likeid', validate.likes, async (req, res, next) => {
    try {
        const data = await postsQueries.deletePostLike(req.params.likeid, req.user);
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

/* posts */

router.get('/posts', validate.posts, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    const tag = req.query.tag.toLowerCase() || null;
    const query = req.query.query.toLowerCase() || null;
    const profiles = req.query.profiles.split(',') || null;
    const comms = req.query.communities.split(',') || null;
    let data;
    try {
        if (query) data = await postsQueries.getSearchedPosts(query, req.user, offset);
        else if (tag) data = await postsQueries.getPostsByTag(tag, req.user, offset);
        else if (profiles) data = await postsQueries.getProfilesPosts(req.user, profiles, offset);
        else if (comms) data = await postsQueries.getCommunitiesPosts(req.user, comms, offset);
        else data = await postsQueries.getTrendingPosts(req.user, offset);
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


module.exports = router;
