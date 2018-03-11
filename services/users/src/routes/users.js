/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
const express = require('express');
const gm = require('gm');
const { encodeToken } = require('../auth/local');
const queries = require('../db/queries.js');
const { users } = require('./validation');
const helpers = require('./_helpers');
// const fs = require('fs');

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
        if (errors.length) {
            res.status(422).json({
                status: 'validation failed',
                failures: errors
            });
        } else {
            return next(err);
        }
    }
});

router.post('/login', users, async (req, res, next) => {
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
        delete user.password;
        const token = await encodeToken(user.id);
        user.token = token;
        await queries.updateUser({ active: true }, user.id);
        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (err) {
        if (errors.length) {
            res.status(422).json({
                status: 'validation failed',
                failures: errors
            });
        } else {
            return next(err);
        }
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

router.put('/', async (req, res, next) => {
    let isAvatar = false;
    let data;
    console.log('gg', req.body);
    // console.log('ll', fs.createReadStream(req.body.files.avatar.path));
    try {
        if (req.files && req.files.avatar.name) {
            const avatar = await gm(req.files.avatar.data)
                .resize(100, 100)
                .setFormat('jpeg')
                .toBuffer((err, buffer) => {
                    if (err) {
                        throw new Error(err);
                    } else { return buffer; }
                });
            data = await queries.updateUser({ avatar }, req.user);
            isAvatar = true;
        } else {
            const newUserData = { [req.body.option]: req.body.value };
            data = await queries.updateUser(newUserData, req.user);
        }
        res.status(200).json({
            status: 'success',
            data: isAvatar ? data.toString('base64') : data
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


/* profies */

router.get('/', users, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    const query = req.query.query ? req.query.query.toLowerCase() : null;
    const list = req.query.users ? req.query.users.split(',') : null;
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
    const lim = req.params.lim || null;
    try {
        const isExist = await queries.findProfileByName(name);
        if (!isExist) throw new Error(`User ${name} is not found`);
        const data = await queries.getProfile(name, lim, req.user);
        data.avatar = data.avatar.toString('base64');
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
