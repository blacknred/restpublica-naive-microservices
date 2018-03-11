/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
const express = require('express');
const gm = require('gm');
const queries = require('../db/queries.js');
const { communities } = require('./validation');
const helpers = require('./_helpers');

const router = express.Router();

/* communities */

router.post('/', communities, async (req, res, next) => {
    const newCommunity = {
        name: req.body.name,
        title: req.body.title,
        description: req.body.description,
        restricted: req.body.restricted,
        posts_moderation: req.body.posts_moderation,
        admin_id: req.user
    };
    const errors = [];
    try {
        const name = await queries.findCommunityByName(newCommunity.name);
        if (name) {
            errors.push({
                param: 'name',
                msg: `name ${newCommunity.name} already in use`
            });
            throw new Error();
        }
        if (!req.files.avatar) {
            newCommunity.avatar = helpers.createAvatar(newCommunity.title);
        } else {
            newCommunity.avatar = await gm(req.files.avatar.data)
                .resize(100, 100)
                .toBuffer('JPG', (err, buffer) => {
                    if (err) throw new Error(err);
                    return buffer;
                });
        }
        if (req.files.theme) {
            newCommunity.theme = await gm(req.files.theme.data)
                .resize(800, 100)
                .toBuffer('JPG', (err, buffer) => {
                    if (err) throw new Error(err);
                    return buffer;
                });
        }
        const community = await queries.createCommunity(newCommunity);
        community.avatar = community.avatar.toString('base64');
        community.theme = community.theme.toString('base64');
        res.status(200).json({
            status: 'success',
            data: community
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

router.get('/', communities, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    const query = req.query.query.toLowerCase() || null;
    const list = req.query.list.split(',') || null;
    const profiles = req.query.profiles.split(',') || req.user;
    const admin = req.query.admin || req.user;
    const lim = req.params.lim || null;
    let data;
    try {
        if (query) data = await queries.getSearchedCommunities(query, req.user, lim, offset);
        else if (list) data = await queries.getCommunities(list, lim, offset);
        else if (admin) data = await queries.getCommunitiesByAdmin(req.user, lim, offset);
        else if (profiles) data = await queries.getUserCommunities(req.user, lim, offset);
        else data = await queries.getTrendingCommunities(req.user, lim, offset);
        if (!lim) {
            data.communities.forEach((com) => {
                com.avatar = com.avatar.toString('base64');
                com.background = com.background.toString('base64');
            });
        }
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/:name', communities, async (req, res, next) => {
    const name = req.params.name;
    const lim = req.params.lim || null;
    try {
        const isExist = await queries.findCommunityByName(name);
        if (!isExist) throw new Error(`Community ${name} is not found`);
        const data = await queries.getCommunity(name, lim, req.user);
        data.avatar = data.avatar.toString('base64');
        data.background = data.background.toString('base64');
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.put('/:cid', communities, async (req, res, next) => {
    const id = req.params.cid;
    let data;
    try {
        if (!req.files) {
            const newCommunityData = { [req.body.option]: req.body.value };
            data = await queries.updateCommunity(newCommunityData, id, req.user);
        } else if (req.files.avatar) {
            const avatar = await gm(req.files.avatar.data)
                .resize(100, 100)
                .toBuffer('JPG', (err, buffer) => {
                    if (err) throw new Error(err);
                    return buffer;
                });
            data = await queries.updateCommunity({ avatar }, id, req.user);
        } else {
            const theme = await gm(req.files.theme.data)
                .resize(800, 100)
                .toBuffer('JPG', (err, buffer) => {
                    if (err) throw new Error(err);
                    return buffer;
                });
            data = await queries.updateCommunity({ theme }, id, req.user);
        }
        res.status(200).json({
            status: 'success',
            data: !req.files ? data : data.toString('base64')
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:cid', communities, async (req, res, next) => {
    try {
        const data = await queries.deleteCommunity(req.params.cid, req.user);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
