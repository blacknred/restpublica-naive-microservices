/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
const express = require('express');
const gm = require('gm');
const auth = require('../auth/local');
const queries = require('../db/queries.js');
const validate = require('./validation');
const helpers = require('./_helpers');

const router = express.Router();

/* profiles */

router.post('/', validate.user, async (req, res, next) => {
    const newUser = {
        username: req.body.username,
        fullname: req.body.fullname,
        email: req.body.email,
        password: req.body.password
    };
    const errors = [];
    try {
        const name = await queries.findProfileByName(newUser.username);
        if (name) {
            errors.push({
                param: 'username',
                msg: `Name ${newUser.name} is already in use`
            });
            throw new Error(`Name ${newUser.name} is already in use`);
        }
        const email = await queries.findProfileByEmail(newUser.email);
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
        const user = await queries.createUser(newUser);
        user.avatar = user.avatar.toString('base64');
        const token = await auth.encodeToken(user.id);
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

router.post('/login', async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const errors = [];
    try {
        const user = await queries.findProfileByName(username);
        if (!user) {
            errors.push({
                param: 'username',
                msg: `Name ${username} is not in use`
            });
            throw new Error(`Name ${username} is not in use`);
        }
        if (!queries.comparePass(password, user.password)) {
            errors.push({
                param: 'password',
                msg: 'Incorrect password'
            });
            throw new Error('Incorrect password');
        }
        user.avatar = user.avatar.toString('base64');
        const token = await auth.encodeToken(user.id);
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

router.get('/', validate.profiles, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    const query = req.query.query ? req.query.query.toLowerCase() : null;
    const list = req.query.users ? req.query.users.split(',') : null;
    let data;
    try {
        if (query) data = await queries.getSearchedProfiles(query, req.user, offset);
        else if (list) data = await queries.getProfilesData(list, req.user);
        else data = await queries.getTrendingProfiles(req.user, offset);
        // data.users.forEach(user => user.avatar = user.avatar.toString('base64'));
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
        const user = await queries.checkUser(req.user);
        res.status(200).json({
            status: 'success',
            id: user.id
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/user', async (req, res, next) => {
    try {
        const data = await queries.getUserData(req.user);
        data.avatar = data.avatar.toString('base64');
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/:name', async (req, res, next) => {
    const name = req.params.name;
    try {
        let profile = await queries.findProfileByName(name);
        if (!profile) throw new Error(`User ${name} is not found`);
        profile = await queries.getProfileData(name, req.user);
        profile.avatar = profile.avatar.toString('base64');
        res.status(200).json({
            status: 'success',
            data: profile
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/:name/id', async (req, res, next) => {
    const name = req.params.name;
    try {
        const profile = await queries.findProfileByName(name);
        if (!profile) throw new Error(`User ${name} is not found`);
        res.status(200).json({
            status: 'success',
            data: profile.id
        });
    } catch (err) {
        return next(err);
    }
});

router.put('/', validate.user, async (req, res, next) => {
    let data;
    try {
        if (req.files.avatar) {
            const avatar = await gm(req.files.avatar.data)
                .resize(100, 100)
                .toBuffer('JPG', (err, buffer) => {
                    if (err) throw new Error(err);
                    return buffer;
                });
            data = await queries.updateUser({ avatar }, req.user);
        } else {
            const newUserData = { [req.body.option]: req.body.value };
            data = await queries.updateUser(newUserData, req.user);
        }
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
        const data = await queries.deleteUser(req.user);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

/* subscriptions */

router.post('/:uid/follow', validate.subscriptions,
    async (req, res, next) => {
        const newSubscription = {
            user_id: req.body.id,
            sub_user_id: req.user
        };
        try {
            const data = await queries.createSubscription(newSubscription);
            res.status(200).json({
                status: 'success',
                data
            });
        } catch (err) {
            return next(err);
        }
    }
);

router.get('/:uid/followers', validate.subscriptions,
    async (req, res, next) => {
        const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
        try {
            const data = await queries.getFollowers(req.params.uid, req.user, offset);
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

router.get('/:uid/following', validate.subscriptions,
    async (req, res, next) => {
        const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
        try {
            const data = await queries.getFollowing(req.params.uid, req.user, offset);
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

router.get('/:uid/following/ids', validate.subscriptions,
    async (req, res, next) => {
        const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
        try {
            const data = await queries.getFollowingIds(req.params.uid, offset, req.user);
            res.status(200).json({
                status: 'success',
                data
            });
        } catch (err) {
            return next(err);
        }
    }
);

router.delete('/:uid/follow/:sid', validate.subscriptions,
    async (req, res, next) => {
        try {
            const data = await queries.deleteSubscription(req.params.sid, req.user);
            res.status(200).json({
                status: 'success',
                data
            });
        } catch (err) {
            return next(err);
        }
    }
);

module.exports = router;
