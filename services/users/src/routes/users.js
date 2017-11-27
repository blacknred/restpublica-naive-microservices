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

router.post('/register', validate.validateUser, (req, res) => {
        const newUser = {
            name: req.body.username,
            fullname: req.body.fullname,
            email: req.body.email,
            password: req.body.password
        };
        const user = { name: req.body.username };
        const errors = [];
        return authHelpers.findUserByName(newUser.name)
            .then((response) => {
                if (response) {
                    errors.push({
                        param: 'username',
                        msg: `Name ${newUser.name} is already in use`
                    });
                    throw new Error(`Name ${newUser.name} is already in use`);
                }
                return authHelpers.findUserByEmail(newUser.email);
            })
            .then((response) => {
                if (response) {
                    errors.push({
                        param: 'email',
                        msg: `Email ${newUser.email} is already in use`
                    });
                    throw new Error(`Email ${newUser.email} is already in use`);
                }
                return authHelpers.createUser(newUser);
            })
            .then((response) => {
                user.id = response[0].id;
                user.avatar = response[0].avatar.toString('base64');
                return localAuth.encodeToken(response[0].id);
            })
            .then((token) => {
                user.token = token;
                res.status(200).json({
                    status: 'success',
                    user
                });
            })
            .catch((err) => {
                if (errors.length) {
                    res.status(200).json({
                        status: 'Validation failed',
                        failures: errors
                    });
                } else {
                    res.status(500).json({
                        status: 'error',
                        message: err.message
                    });
                }
            });
    });

router.post('/login', validate.validateUserLogin, (req, res) => {
    const name = req.body.username;
    const password = req.body.password;
    const user = { name: req.body.username };
    const errors = [];
    return authHelpers.findUserByName(name)
        .then((response) => {
            if (!response) {
                errors.push({
                    param: 'username',
                    msg: `Name ${name} is not in use`
                });
                throw new Error(`Name ${name} is not in use`);
            }
            if (!authHelpers.comparePass(password, response.password)) {
                errors.push({
                    param: 'password',
                    msg: 'Incorrect password'
                });
                throw new Error('Incorrect password');
            }
            user.id = response.id;
            user.avatar = response.avatar.toString('base64');
            return response.id;
        })
        .then((response) => {
            return localAuth.encodeToken(response);
        })
        .then((token) => {
            user.token = token;
            res.status(200).json({
                status: 'success',
                user
            });
        })
        .catch((err) => {
            if (errors.length) {
                res.status(200).json({
                    status: 'Validation failed',
                    failures: errors
                });
            } else {
                res.status(500).json({
                    status: 'error',
                    message: err.message
                });
            }
        });
});

router.put('/update', validate.validateUser, authHelpers.ensureAuthenticated,
    (req, res) => {
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
                    message: err.message
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
                    message: err.message
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
                    message: err.message
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
                    message: err.message
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
                    message: err.message
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
                    message: err.message
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
                    message: err.message
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
                    message: err.message
                });
            });
    });


module.exports = router;
