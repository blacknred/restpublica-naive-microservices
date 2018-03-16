/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
const express = require('express');
// const gm = require('gm');
const resizeImg = require('resize-img');
const { encodeToken } = require('../auth/local');
const queries = require('../db/queries.js');
const { users } = require('./validation');
const helpers = require('./_helpers');

const router = express.Router();


/* users */

router.post('/', users, async (req, res, next) => {
    const newUser = {
        username: req.body.username,
        fullname: req.body.fullname.toLowerCase().split(' ')
            .map(word => word[0].toUpperCase() + word.substr(1)).join(' '),
        email: req.body.email,
        password: req.body.password
    };
    try {
        newUser.avatar = await helpers.createAvatar(newUser.fullname);
        const data = await queries.createUser(newUser);
        data.avatar = data.avatar.toString('base64');
        const token = await encodeToken(data.id);
        data.token = token;
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.post('/login', users, async (req, res, next) => {
    const username = req.body.username;
    try {
        const user = await queries.findProfileByName(username);
        delete user.password;
        user.avatar = user.avatar.toString('base64');
        const token = await encodeToken(user.id);
        user.token = token;
        await queries.updateUser({ active: true }, user.id);
        res.status(200).json({
            status: 'success',
            data: user
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
            user
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/check/admin', async (req, res, next) => {
    try {
        const admin = await queries.checkAdmin(req.user);
        res.status(200).json({
            status: 'success',
            admin
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/user', async (req, res, next) => {
    try {
        const data = await queries.getUser(req.user);
        data.avatar = data.avatar.toString('base64');
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.put('/', users, async (req, res, next) => {
    let isAvatar = false;
    let data;
    try {
        if (req.body.option === 'avatar') {
            isAvatar = true;
            const bin = await new Buffer(req.body.value, 'base64');
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
        }
        if (req.body.option === 'active') await queries.deleteSubscriptions();
        const newUserData = { [req.body.option]: req.body.value };
        data = await queries.updateUser(newUserData, req.user);
        if (isAvatar) data = data.toString('base64');
        res.status(200).json({
            status: 'success',
            data: { [req.body.option]: data }
        });
    } catch (err) {
        return next(err);
    }
});


/* profies */

router.get('/', users, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    const query = req.query.query ? req.query.query.toLowerCase() : null;
    const list = req.query.list ? req.query.list.split(',') : null;
    let data;
    try {
        if (query) data = await queries.getSearchedProfiles(query, req.user, offset);
        else if (list) data = await queries.getProfiles(list, req.user);
        else data = await queries.getTrendingProfiles(req.user, offset);
        data.users.forEach(user => user.avatar = user.avatar.toString('base64'));
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/:name', users, async (req, res, next) => {
    const name = req.params.name;
    const lim = req.query.lim || null;
    try {
        const isExist = await queries.findProfileByName(name);
        if (!isExist) throw new Error(`User ${name} is not found`);
        const data = await queries.getProfile(name, lim, req.user);
        if (data.avatar) data.avatar = data.avatar.toString('base64');
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const data = await queries.deleteUsers();
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
