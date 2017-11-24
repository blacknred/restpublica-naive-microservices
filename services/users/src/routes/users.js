const express = require('express');
const localAuth = require('../auth/local');
const authHelpers = require('../auth/_helpers');
const validate = require('./validation');

const router = express.Router();

/* status */

router.get('/status', (req, res) => {
    res.send('ok');
});

/* auth */

router.post('/register', validate.validateUserLogin,
    authHelpers.dbValidation, (req, res) => {
        const newUser = {
            name: req.body.username,
            fullname: req.body.fullname,
            email: req.body.email,
            password: req.body.password
        };
        return authHelpers.createUser(newUser)
            .then((user) => {
                return localAuth.encodeToken(user[0]);
            })
            .then((token) => {
                res.status(200).json({
                    status: 'success',
                    token
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });

router.post('/login', validate.validateUserLogin, (req, res) => {
    const name = req.body.username;
    const password = req.body.password;
    return authHelpers.findUserByName(name)
        .then((response) => {
            if (!authHelpers.comparePass(password, response.password)) {
                throw new Error('Incorrect password');
            }
            return response;
        })
        .then((response) => {
            return localAuth.encodeToken(response);
        })
        .then((token) => {
            res.status(200).json({
                status: 'success',
                token
            });
        })
        .catch((err) => {
            res.status(500).json({
                status: 'error',
                message: err
            });
        });
});

router.put('/update', validate.validateUser, authHelpers.ensureAuthenticated,
    authHelpers.dbValidation, (req, res) => {
        const newUser = {
            name: req.body.name,
            fullname: req.body.fullname,
            email: req.body.email,
            password: req.body.password,
            avatar: req.body.avatar
        };
        return authHelpers.updateUser(req.user, newUser)
            .then((user) => {
                res.status(200).json({
                    status: 'success',
                    user
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });

router.get('/current', authHelpers.ensureAuthenticated,
    (req, res) => {
        return authHelpers.getUser(req.user)
            .then((user) => {
                res.status(200).json({
                    status: 'success',
                    user
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });

router.get('/user/:username', validate.validateUserLogin,
    authHelpers.ensureAuthenticated, (req, res) => {
        const userName = req.params.username;
        return authHelpers.getUserByName(userName)
            .then((user) => {
                res.status(200).json({
                    status: 'success',
                    user
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });

router.get('/concise', authHelpers.ensureAuthenticated,
    (req, res) => {
        const usersIdsArr = req.query.ids.split(',') || [];
        return authHelpers.getConciseUsers(usersIdsArr)
            .then((usersdata) => {
                res.status(200).json({
                    status: 'success',
                    users: usersdata
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });

/* subscriptions */

router.get('/subscriptions',
    authHelpers.ensureAuthenticated, (req, res) => {
        return authHelpers.getSubscriptions(req.user)
            .then((users) => {
                res.status(200).json({
                    status: 'success',
                    subscriptions: users
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });

router.get('/subscription/:id', validate.validateUserSubscriptions,
    authHelpers.ensureAuthenticated, (req, res) => {
        const subUserId = req.params.id;
        return authHelpers.checkSubscription(req.user, subUserId)
            .then((status) => {
                res.status(200).json({
                    status: 'success',
                    subscription: status
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });
router.post('/subscription', validate.validateUserSubscriptions,
    authHelpers.ensureAuthenticated, (req, res) => {
        const subUserId = req.body.id;
        return authHelpers.createSubscription(req.user, subUserId)
            .then(() => {
                res.status(200).json({
                    status: 'success',
                    subscription: 'Subscription created!'
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err
                });
            });
    });
router.delete('/subscription/:id', validate.validateUserSubscriptions,
    authHelpers.ensureAuthenticated, (req, res) => {
        const subscriptionUserId = req.params.id;
        return authHelpers.deleteSubscription(req.user, subscriptionUserId)
            .then(() => {
                res.status(200).json({
                    status: 'success',
                    subscription: 'Subscription deleted'
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
