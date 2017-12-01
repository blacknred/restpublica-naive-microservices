const express = require('express');
const sharp = require('sharp');
const localAuth = require('../auth/local');
const authHelpers = require('../auth/_helpers');
const validate = require('./validation');

const router = express.Router();

/* status */

router.get('/status', (req, res) => {
    res.send('ok');
});

/* auth */

router.get('/check', validate.validateUserLogin, (req, res) => {
    return res.status(200).json({
        status: 'success',
        id: req.user
    });
});

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

router.put('/update', validate.validateUser,
    authHelpers.ensureAuthenticated, (req, res) => {
        const newUserData = {
            username: req.body.username,
            fullname: req.body.fullname,
            description: req.body.description,
            email: req.body.email
        };
        authHelpers.updateUser(req.user, newUserData)
            .then((user) => {
                res.status(200).json({
                    status: 'success',
                    user: user[0]
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err.message
                });
            });
    }
);

router.put('/update/userpic', authHelpers.ensureAuthenticated,
    (req, res) => {
        return !req.files.userPic ?
            res.status(400).json({
                status: 'error',
                message: 'No image was uploaded'
            }) :
            sharp(req.files.userPic.data)
                .resize(100, 100)
                .toBuffer()
                .then((outputBuffer) => {
                    return authHelpers.updateUserPic(req.user, outputBuffer);
                })
                .then((avatar) => {
                    const userpic = avatar[0].toString('base64');
                    res.status(200).json({
                        status: 'success',
                        avatar: userpic
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                        status: 'error',
                        message: err.message
                    });
                });
    }
);

router.get('/profile', authHelpers.ensureAuthenticated,
    (req, res) => {
        return authHelpers.getProfileData(req.user)
            .then((user) => {
                /* eslint-disable */
                user.avatar = user.avatar.toString('base64');
                /* eslint-enable */
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
    }
);

router.get('/u/:username', validate.validateUserLogin,
    authHelpers.ensureAuthenticated, (req, res) => {
        return authHelpers.getUserData(req.user, req.params.username)
            .then((user) => {
                if (user == null) throw Error(`Username ${req.params.username} not in use`);
                /* eslint-disable */
                user.avatar = user.avatar.toString('base64');
                /* eslint-enable */
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
    }
);

router.get('/users', authHelpers.ensureAuthenticated, (req, res) => {
    const usersIdsArr = req.query.ids.split(',') || [];
    return authHelpers.getUsersData(usersIdsArr)
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
                /* eslint-disable */
                users.forEach(user => user.avatar = user.avatar.toString('base64'));
                /* eslint-enable */
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
    }
);

router.post('/subscription', validate.validateUserSubscriptions,
    authHelpers.ensureAuthenticated, (req, res) => {
        const subUserId = req.body.id;
        return authHelpers.createSubscription(subUserId, req.user)
            .then((id) => {
                // console.log(resp);
                res.status(200).json({
                    status: 'success',
                    subscription: id
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err.message
                });
            });
    }
);

router.delete('/subscription/:id', validate.validateUserSubscriptions,
    authHelpers.ensureAuthenticated, (req, res) => {
        return authHelpers.deleteSubscription(req.params.id)
            .then((id) => {
                res.status(200).json({
                    status: 'success',
                    subscription: id[0]
                });
            })
            .catch((err) => {
                res.status(500).json({
                    status: 'error',
                    message: err.message
                });
            });
    }
);

module.exports = router;
