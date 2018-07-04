/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable no-throw-literal */
/* eslint-disable no-case-declarations */

// const gm = require('gm');
const express = require('express');
const resizeImg = require('resize-img');
const { encodeToken } = require('../auth/local');
const User = require('../db/models/User');
const Subscription = require('../db/models/Subscription');
const { users } = require('./validation');
const helpers = require('./_helpers');
const { ensureAuthenticated } = require('../auth');

const router = express.Router();

const REDUCED_DIMENTIONS = {
    avatar: { width: 128, height: 128 },
    banner: { width: 600, height: 300 }
};


/* user */

router.post('/', users, async (req, res, next) => {
    const newUser = {
        username: req.body.username.split(' ').join('_').toLowerCase(),
        fullname: req.body.fullname.toLowerCase().split(' ')
            .map(word => word[0].toUpperCase() + word.substr(1)).join(' '),
        email: req.body.email,
        password: req.body.password
    };
    try {
        const name = await User.isExist({ username: newUser.username });
        if (name) {
            throw {
                status: 409,
                message: { param: 'username', msg: 'Username is already in use' }
            };
        }
        const email = await User.isExist({ email: newUser.email });
        if (email) {
            throw {
                status: 409,
                message: { param: 'email', msg: 'Email is already in use' }
            };
        }
        newUser.avatar = await helpers.createAvatar(newUser.fullname);
        const data = await User.create(newUser);
        data.avatar = data.avatar.toString('base64');
        if (data.banner) data.banner = data.banner.toString('base64');
        data.token = await encodeToken(data.id);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.post('/login', users, async (req, res, next) => {
    try {
        const user = await User.isExist({ username: req.body.username });
        if (!user) {
            throw {
                status: 401,
                message: { param: 'username', msg: 'Username is not in use' }
            };
        }
        const isPass = await User.comparePass(req.body.password, user.id);
        if (!isPass) {
            throw {
                status: 401,
                message: { param: 'password', msg: 'Incorrect password' }
            };
        }
        user.avatar = user.avatar.toString('base64');
        const token = await encodeToken(user.id);
        user.token = token;
        delete user.admin;
        await User.update({ active: true }, user.id);
        res.status(200).json({ status: 'success', data: user });
    } catch (err) {
        return next(err);
    }
});

router.get('/check', users, async (req, res, next) => {
    try {
        const user = await User.isExist({ id: req.user });
        const { id, admin } = user;
        res.status(200).json({ status: 'success', data: { id, admin } });
    } catch (err) {
        return next(err);
    }
});

router.get('/profile', ensureAuthenticated, async (req, res, next) => {
    try {
        const data = await User.getUser(req.user);
        data.avatar = data.avatar.toString('base64');
        if (data.banner) data.banner = data.banner.toString('base64');
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.put('/', ensureAuthenticated, users, async (req, res, next) => {
    try {
        switch (req.body.option) {
            case 'username':
                const name = await User.isExist({ username: req.body.value });
                if (name) {
                    throw {
                        status: 409,
                        message: { param: 'username', msg: 'Username is already in use' }
                    };
                }
                break;
            case 'email':
                const email = await User.isExist({ email: req.body.value });
                if (email) {
                    throw {
                        status: 409,
                        message: { param: 'email', msg: 'Email is already in use' }
                    };
                }
                break;
            case 'avatar':
            case 'banner':
                const sanitisedValue = req.body.value.replace(/\n/g, '');
                const bin = await new Buffer(sanitisedValue, 'base64');
                await resizeImg(bin, REDUCED_DIMENTIONS[req.body.option])
                    .then(buf => req.body.value = buf);
                // TODO: resize image with gm
                // await gm(bin, 'img.png')
                //     .resize(128, 128)
                //     .toBuffer('PNG', (err, buffer) => {
                //         if (err) throw new Error(err);
                //         console.log(buffer.length);
                //         req.body.value = buffer;
                //     });
                break;
            case 'fullname':
                req.body.value.toLowerCase().split(' ')
                    .map(word => word[0].toUpperCase() + word.substr(1)).join(' ');
                break;
            case 'active': await Subscription.deleteAll(req.user); break;
            default:
        }
        const updatedValue = { [req.body.option]: req.body.value };
        let data = await User.update(updatedValue, req.user);
        if (req.body.option.match(/(avatar|banner)/)) data = data.toString('base64');
        res.status(200).json({ status: 'success', data: { [req.body.option]: data } });
    } catch (err) {
        return next(err);
    }
});


/* profiles */

router.get('/', users, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ?
        --req.query.offset : 0;
    const query = req.query.q ? req.query.q.toLowerCase() : null;
    const list = req.query.list ? req.query.list.split(',') : null;
    const limiter = req.query.lim || null;
    const reduced = req.useragent.isMobile || req.query.reduced || false;
    let data;
    try {
        if (query) data = await User.getAllSearched({ query, userId: req.user, offset, reduced });
        else if (list) data = await User.getAllInList({ list, userId: req.user, limiter });
        else data = await User.getAllTrending({ userId: req.user, offset, reduced });
        if (data.profiles[0]) {
            data.profiles.forEach((user) => {
                user.avatar = user.avatar.toString('base64');
                if (user.banner) user.banner = user.banner.toString('base64');
            });
        }
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.get('/:name', async (req, res, next) => {
    try {
        const data = await User.getOne(req.params.name, req.user);
        if (!data) throw { status: 404, message: 'Profile not found' };
        if (data.avatar) data.avatar = data.avatar.toString('base64');
        if (data.banner) data.banner = data.banner.toString('base64');
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const data = await User.deleteAllInactive();
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
