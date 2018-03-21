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


/* users */

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
        if (name) throw { status: 409, message: 'Username is already in use' };
        const email = await User.isExist({ email: newUser.email });
        if (email) throw { status: 409, message: 'Email is already in use' };
        newUser.avatar = await helpers.createAvatar(newUser.fullname);
        const data = await User.create(newUser);
        data.avatar = data.avatar.toString('base64');
        const token = await encodeToken(data.id);
        data.token = token;
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.post('/login', users, async (req, res, next) => {
    try {
        const user = await User.isExist({ username: req.body.username });
        if (!user) throw { status: 401, message: 'Username is not in use' };
        const isPass = await User.comparePass(req.body.password, user.password);
        if (!isPass) throw { status: 401, message: 'Incorrect password' };
        delete user.password;
        user.avatar = user.avatar.toString('base64');
        const token = await encodeToken(user.id);
        user.token = token;
        await User.update({ active: true }, user.id);
        res.status(200).json({ status: 'success', data: user });
    } catch (err) {
        return next(err);
    }
});

router.get('/check', users, async (req, res, next) => {
    const mode = req.query.mode || 'user';
    let patternObj = null;
    try {
        switch (mode) {
            case 'admin': patternObj = { id: req.user, admin: true }; break;
            default: patternObj = { id: req.user, active: true };
        }
        const user = await User.isExist(patternObj);
        res.status(200).json({ status: 'success', user: user.id || null });
    } catch (err) {
        return next(err);
    }
});

router.get('/profile', ensureAuthenticated, async (req, res, next) => {
    try {
        const data = await User.getUser(req.user);
        data.avatar = data.avatar.toString('base64');
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.put('/', ensureAuthenticated, users, async (req, res, next) => {
    try {
        switch (req.body.option) {
            case 'username':
                const name = await User.isExist({ username: req.body.username });
                if (name) throw { status: 409, message: 'Username is already in use' };
                break;
            case 'email':
                const email = await User.isExist({ email: req.body.email });
                if (email) throw { status: 409, message: 'Email is already in use' };
                break;
            case 'avatar':
                const sanitisedValue = req.body.value.replace(/\n/g, '');
                const bin = await new Buffer(sanitisedValue, 'base64');
                await resizeImg(bin, { width: 128, height: 128 })
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
                req.body.fullname.toLowerCase().split(' ')
                    .map(word => word[0].toUpperCase() + word.substr(1)).join(' ');
                break;
            case 'active': await Subscription.deleteAll(req.user); break;
            default:
        }
        const newUser = { [req.body.option]: req.body.value };
        let data = await User.update(newUser, req.user);
        if (req.body.option === 'avatar') data = data.toString('base64');
        res.status(200).json({ status: 'success', data: { [req.body.option]: data } });
    } catch (err) {
        return next(err);
    }
});


/* profiles */

router.get('/', users, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ?
        --req.query.offset : 0;
    const query = req.query.query ? req.query.query.toLowerCase() : null;
    const list = req.query.list ? req.query.list.split(',') : null;
    const limiter = req.query.lim || null;
    const reduced = req.useragent.isMobile;
    let data;
    try {
        if (query) data = await User.getAllSearched(query, req.user, offset, reduced);
        else if (list) data = await User.getAllInList(list, req.user, limiter);
        else data = await User.getAllTrending(req.user, offset, reduced);
        if (!limiter || limiter === 'avatar') {
            data.users.forEach(user => user.avatar = user.avatar.toString('base64'));
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
