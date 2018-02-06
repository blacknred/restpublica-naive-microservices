/* eslint-disable consistent-return */
const express = require('express');
const sharp = require('sharp');
const localAuth = require('../auth/local');
const usersQueries = require('../db/queries.js');
const validate = require('./validation');
const helpers = require('./_helpers');

const router = express.Router();

/* status */

router.get('/ping', (req, res) => {
    res.send('pong');
});

/* user */

router.post('/', validate.user, async (req, res, next) => {
    const newUser = {
        username: req.body.username,
        fullname: req.body.fullname,
        email: req.body.email,
        password: req.body.password
    };
    const errors = [];
    try {
        const name = await usersQueries.findUserByName(newUser.username);
        if (name) {
            errors.push({
                param: 'username',
                msg: `Name ${newUser.name} is already in use`
            });
            throw new Error(`Name ${newUser.name} is already in use`);
        }
        const email = await usersQueries.findUserByEmail(newUser.email);
        if (email) {
            errors.push({
                param: 'email',
                msg: `Email ${newUser.email} is already in use`
            });
            throw new Error(`Email ${newUser.email} is already in use`);
        }
        if (newUser.avatar === null) {
            newUser.avatar = helpers.createAvatar(newUser.fullname);
        }
        const user = await usersQueries.createUser(newUser);
        // if (newUserData.name) throw new Error(newUserData.detail || newUserData.message);
        user.avatar = user.avatar.toString('base64');
        const token = await localAuth.encodeToken(user.id);
        user.token = token;
        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (err) {
        if (errors.length) {
            res.status(422).json({
                status: 'Validation failed',
                failures: errors
            });
        } else {
            return next(err);
        }
    }
});

router.put('/', validate.user, async (req, res, next) => {
    let data;
    try {
        if (req.files.avatar) {
            const avatar = await sharp(req.files.avatar.data)
                .resize(100, 100)
                .toBuffer();
            data = await usersQueries.updateUser({ avatar }, req.user);
        } else {
            const newUserData = { [req.body.option]: req.body.value };
            data = await usersQueries.updateUser(newUserData, req.user);
        }
        // if (data.name) throw new Error(data.detail || data.message);
        res.status(200).json({
            status: 'success',
            data: !req.files.avatar ? data : data.toString('base64')
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const data = await usersQueries.deleteUser(req.user);
        // if (data.name) throw new Error(data.detail || data.message);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/check', async (req, res, next) => {
    try {
        const user = await usersQueries.checkUser(req.user);
        res.status(200).json({
            status: 'success',
            id: user.id
        });
    } catch (err) {
        return next(err);
    }
});

router.post('/login', async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const errors = [];
    try {
        const user = await usersQueries.findUserByName(username);
        if (!user) {
            errors.push({
                param: 'username',
                msg: `Name ${username} is not in use`
            });
            throw new Error(`Name ${username} is not in use`);
        }
        if (!usersQueries.comparePass(password, user.password)) {
            errors.push({
                param: 'password',
                msg: 'Incorrect password'
            });
            throw new Error('Incorrect password');
        }
        user.avatar = user.avatar.toString('base64');
        const token = await localAuth.encodeToken(user.id);
        user.token = token;
        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (err) {
        if (errors.length) {
            res.status(422).json({
                status: 'Validation failed',
                failures: errors
            });
        } else {
            return next(err);
        }
    }
});

router.get('/user', async (req, res, next) => {
    try {
        const data = await usersQueries.getUserData(req.user);
        // if (data.name) throw new Error(data.detail || data.message);
        // eslint-disable-next-line
        data.avatar = data.avatar.toString('base64');
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

// router.get('/user/following/list', async (req, res, next) => {
//    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
//     try {
//         const data = await usersQueries.getFollowinIds(req.user, offset);
//         // if (data.name) throw new Error(data.detail || data.message);
//         res.status(200).json({
//             status: 'success',
//             data
//         });
//     } catch (err) {
//         return next(err);
//     }
// });

/* profile */

router.get('/:username', async (req, res, next) => {
    const name = req.params.username;
    try {
        const isUser = await usersQueries.findUserByName(name);
        if (!isUser) throw new Error(`User ${name} is not found`);
        const profile = await usersQueries.getProfileData(name, req.user);
        // if (profile.name) throw new Error(profile.detail || profile.message);
        // eslint-disable-next-line
        profile.avatar = profile.avatar.toString('base64');
        // const userPostsCount = await helpers.getUserPostsCount(profile.id);
        // profile.posts_count = userPostsCount;
        res.status(200).json({
            status: 'success',
            data: profile
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/:username/id', async (req, res, next) => {
    const name = req.params.username;
    try {
        const user = await usersQueries.findUserByName(name);
        if (!user) throw new Error(`Name ${name} is not in use`);
        res.status(200).json({
            status: 'success',
            data: user.id
        });
    } catch (err) {
        return next(err);
    }
});

/* subscriptions */

router.post('/:id/follow', validate.subscriptions,
    async (req, res, next) => {
        const newSubscription = {
            user_id: req.body.id,
            sub_user_id: req.user
        };
        try {
            const data = await usersQueries.createSubscription(newSubscription);
            // if (data.name) throw new Error(data.detail || data.message);
            res.status(200).json({
                status: 'success',
                data
            });
        } catch (err) {
            return next(err);
        }
    }
);

router.delete('/:id/follow/:subid', validate.subscriptions,
    async (req, res, next) => {
        try {
            const data = await usersQueries.deleteSubscription(req.params.subid, req.user);
            // if (data.name) throw new Error(data.detail || data.message);
            res.status(200).json({
                status: 'success',
                data
            });
        } catch (err) {
            return next(err);
        }
    }
);

router.get('/:id/followers', validate.subscriptions,
    async (req, res, next) => {
        const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
        try {
            const data = await usersQueries.getFollowers(req.params.id, req.user, offset);
            // if (data.name) throw new Error(data.detail || data.message);
            // eslint-disable-next-line
            data.subscriptions.forEach(u => u.avatar = u.avatar.toString('base64'));
            res.status(200).json({
                status: 'success',
                data
            });
        } catch (err) {
            return next(err);
        }
    }
);

router.get('/:id/following', validate.subscriptions,
    async (req, res, next) => {
        const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
        try {
            const data = await usersQueries.getFollowing(req.params.id, req.user, offset);
            // if (data.name) throw new Error(data.detail || data.message);
            // eslint-disable-next-line
            data.subscriptions.forEach(u => u.avatar = u.avatar.toString('base64'));
            res.status(200).json({
                status: 'success',
                data
            });
        } catch (err) {
            return next(err);
        }
    }
);

/* profiles */

router.get('/', validate.profiles, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    const query = req.query.query.toLowerCase() || null;
    const usersArr = req.query.users.split(',') || null;
    let data;
    try {
        if (query) data = await usersQueries.getSearchedProfiles(query, req.user, offset);
        else if (usersArr) data = await usersQueries.getProfilesData(usersArr, req.user);
        else data = await usersQueries.getTrendingProfiles(req.user, offset);
        // if (data.name) throw new Error(data.detail || data.message);
        // eslint-disable-next-line
        data.users.forEach(user => user.avatar = user.avatar.toString('base64'));
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
