/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
const express = require('express');
const gm = require('gm');
const queries = require('../db/queries.js');
const validate = require('./validation');
const helpers = require('./_helpers');

const router = express.Router();

/* communities */

router.post('/', validate.community, async (req, res, next) => {
    const newCommunity = {
        name: req.body.name,
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
                msg: `Name ${newCommunity.name} is already in use`
            });
            throw new Error();
        }
        if (!req.files.avatar) {
            newCommunity.avatar = helpers.createAvatar(newCommunity.fullname);
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

router.get('/', validate.communities, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    const query = req.query.query.toLowerCase() || null;
    const list = req.query.communities.split(',') || null;
    const admin = req.query.admin || null;
    const limiter = req.query.limiter || null;
    let data;
    try {
        if (query) data = await queries.getSearchedCommunities(query, req.user, offset);
        else if (list) data = await queries.getCommunitiesData(list, req.user);
        else if (admin) data = await queries.getUserCommunities(req.user, offset);
        else if (limiter) {
            switch (limiter) {
                case 'dash': data = await queries.getFollowingCommunities(req.user, offset);
                break;
                default:
            }
        } else data = await queries.getTrendingCommunities(req.user, offset);
        if (!limiter) {
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

router.get('/count', validate.communities, async (req, res, next) => {
    const profileId = req.query.profile || req.user;
    try {
        const data = await queries.getCommunitiesCountByProfile(profileId);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/:name', validate.community, async (req, res, next) => {
    console.log('name');
    const name = req.params.name;
    try {
        const isCommunity = await queries.findCommunityByName(name);
        if (!isCommunity) throw new Error(`Community ${name} is not found`);
        const community = await queries.getCommunityData(name, req.user);
        community.avatar = community.avatar.toString('base64');
        community.background = community.background.toString('base64');
        res.status(200).json({
            status: 'success',
            data: community
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/:name/id', validate.community, async (req, res, next) => {
    const name = req.params.name;
    try {
        const community = await queries.findCommunityByName(name);
        if (!community) throw new Error(`Community ${name} is not found`);
        res.status(200).json({
            status: 'success',
            data: community.id
        });
    } catch (err) {
        return next(err);
    }
});

router.put('/:cid', validate.community, async (req, res, next) => {
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

router.delete('/:cid', validate.community, async (req, res, next) => {
    try {
        const data = await queries.deleteCommunity(req.params.cid);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

/* subscriptions */

router.post('/:cid/follow', validate.subscriptions, async (req, res, next) => {
    const newSubscription = {
        community_id: req.body.id,
        user_id: req.user
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
});

router.get('/:cid/followers', validate.subscriptions, async (req, res, next) => {
    const id = req.params.cid;
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    try {
        const data = await queries.getFollowers(id, req.user, offset);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:cid/follow/:sid', validate.subscriptions, async (req, res, next) => {
    try {
        const data = await queries.deleteSubscription(req.params.sid, req.user);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

/* bans */

router.post('/:cid/ban', validate.bans, async (req, res, next) => {
    const newBan = {
        community_id: req.body.id,
        user_id: req.user,
        end_date: req.body.endDate
    };
    try {
        const data = await queries.createBan(newBan);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/:cid/bans', validate.bans, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    const id = req.params.cid;
    try {
        const data = await queries.getBans(id, req.user, offset);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
