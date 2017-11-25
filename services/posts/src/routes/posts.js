// import { error } from 'util';

const express = require('express');
const userQueries = require('../db/queries.js');
const routeHelpers = require('./_helpers');
const newPost = require('./_new_post');
const validate = require('./validation');

const router = express.Router();

/* status */

router.get('/status', (req, res) => {
    res.send('ok');
});

/* posts */

router.get('/dashboard', routeHelpers.ensureAuthenticated,
    (req, res, next) => {
        const offset =
            req.query.offset && /^\+?\d+$/.test(req.query.offset)
                ? req.query.offset : 0;
        return routeHelpers.getSubscriptions(req, next)
            .then((subscriptionsArr) => {
                return userQueries.getDashboard(subscriptionsArr, offset);
            })
            .then((posts) => {
                res.status(200).json({
                    status: 'success',
                    data: posts
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err.message
                });
            });
    });

router.get('/search', routeHelpers.ensureAuthenticated,
    (req, res) => {
        const offset =
            req.query.offset && /^\+?\d+$/.test(req.query.offset)
                ? req.query.offset : 0;
        if (!req.query.q) { throw new Error('Search pattern is empty'); }
        return userQueries.getSearchedPosts(req.query.q, offset)
            .then((posts) => {
                res.json({
                    status: 'success',
                    data: posts
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });

router.get('/popular', routeHelpers.ensureAuthenticated,
    (req, res) => {
        const offset =
            req.query.offset && /^\+?\d+$/.test(req.query.offset)
                ? req.query.offset : 0;
        return userQueries.getPopularPosts(offset)
            .then((posts) => {
                res.json({
                    status: 'success',
                    data: posts
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });

/* eslint-disable no-param-reassign */
router.get('/user/:id', routeHelpers.ensureAuthenticated,
    validate.validatePost, (req, res) => {
        const offset =
            req.query.offset && /^\+?\d+$/.test(req.query.offset)
                ? req.query.offset : 0;
        return userQueries.getUserPosts(req.params.id, offset)
            .then((posts) => {
                res.json({
                    status: 'success',
                    data: posts
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });
/* eslint-enable no-param-reassign */


/* post */

router.get('/:id', routeHelpers.ensureAuthenticated,
    validate.validatePost, (req, res) => {
        return userQueries.getPost(req.params.id)
            .then((post) => {
                res.json({
                    status: 'success',
                    data: post
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });

router.post('/:type', routeHelpers.ensureAuthenticated,
    validate.validatePost, (req, res) => {
        const post = newPost.createPost(req);
        return userQueries.addPost(post)
            .then(() => {
                res.json({
                    status: 'success',
                    data: 'Post added!'
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });

router.put('/:id', routeHelpers.ensureAuthenticated,
    validate.validatePost, (req, res) => {
        const updatedPost = {
            description: req.body.description
        };
        return userQueries.updatePost(req.params.id, updatedPost)
            .then((post) => {
                res.json({
                    status: 'success',
                    data: post
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });

router.delete('/:id', routeHelpers.ensureAuthenticated,
    validate.validatePost, (req, res) => {
        return userQueries.deletePost(req.params.id)
            .then((status) => {
                if (!status) console.log('Files not found!');
                res.json({
                    status: 'success',
                    data: 'Post deleted!'
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });

/* comments */

router.get('/:id/comments', routeHelpers.ensureAuthenticated,
    validate.validateComments, (req, res, next) => {
        const offset =
            req.query.offset && /^\+?\d+$/.test(req.query.offset)
                ? req.query.offset : 0;
        return userQueries.getPostComments(req.params.id, offset)
            .then((comments) => {
                const usersIds = comments.map((user) => {
                    return user.user_id;
                });
                return Promise.all([
                    routeHelpers.getUsersConciseData(usersIds, req, next),
                    comments
                ]);
            })
            /* eslint-disable */
            .then((arrs) => {
                const [usersData, comments] = arrs;
                const finaleArr = usersData.map((x) => {
                    return Object.assign(x, comments.find(y => y.user_id == x.user_id));
                });
                return finaleArr;
            })
            /* eslint-enable */
            .then((fullComments) => {
                res.json({
                    status: 'success',
                    data: fullComments
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });

router.post('/:id/comment', routeHelpers.ensureAuthenticated,
    validate.validateComments, (req, res) => {
        console.log(req.user);
        const newComment = {
            post_id: req.params.id,
            user_id: req.user,
            comment: req.body.comment
        };
        return userQueries.addPostComment(newComment)
            .then(() => {
                res.json({
                    status: 'success',
                    data: 'Comment added!'
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });

router.put('/comment/:id', routeHelpers.ensureAuthenticated,
    validate.validateComments, (req, res) => {
        return userQueries.updatePostComment(req.params.id, req.body.comment)
            .then((post) => {
                res.json({
                    status: 'success',
                    data: post
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });

router.delete('/comment/:id', routeHelpers.ensureAuthenticated,
    validate.validateComments, (req, res) => {
        return userQueries.deletePostComment(req.params.id)
            .then(() => {
                res.json({
                    status: 'success',
                    data: 'Comment deleted!'
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });

/* likes */

router.get('/:id/likes', routeHelpers.ensureAuthenticated,
    validate.validateLikes, (req, res, next) => {
        const offset =
        req.query.offset && /^\+?\d+$/.test(req.query.offset)
            ? req.query.offset : 0;
        return userQueries.getPostLikes(req.params.id, offset)
            .then((likes) => {
                const usersIds = likes.map((user) => {
                    return user.user_id;
                });
                return routeHelpers.getUsersConciseData(usersIds, req, next);
            })
            .then((users) => {
                console.warn(users);
                res.json({
                    status: 'success',
                    data: users
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });

router.post('/like', routeHelpers.ensureAuthenticated,
    validate.validateLikes, (req, res) => {
        return userQueries.addPostLike(req.body.postId, req.user)
            .then(() => {
                res.json({
                    status: 'success',
                    data: 'Like added!'
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });

router.delete('/like/:id', routeHelpers.ensureAuthenticated,
    validate.validateLikes, (req, res) => {
        return userQueries.deletePostLike(req.params.id)
            .then(() => {
                res.json({
                    status: 'success',
                    data: 'Like deleted!'
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });


module.exports = router;
