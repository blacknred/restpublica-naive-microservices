/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-throw-literal */
/* eslint-disable no-case-declarations */

// const gm = require('gm');
const express = require('express');
const resizeImg = require('resize-img');

const helpers = require('./_helpers');
const Ban = require('../db/models/Ban');
const { communities } = require('./validation');
const { ensureAuthenticated } = require('../auth');
const Community = require('../db/models/Community');
const Subscription = require('../db/models/Subscription');

const router = express.Router();

/* communities */

router.post('/', ensureAuthenticated, communities, async (req, res, next) => {
    const newCommunity = {
        name: req.body.name.split(' ').join('_').toLowerCase(),
        title: req.body.title.charAt(0).toUpperCase() + req.body.title.slice(1),
        description: req.body.description,
        restricted: req.body.restricted,
        posts_moderation: req.body.posts_moderation,
        admin_id: req.user
    };
    try {
        const name = await Community.isExist({ name: newCommunity.name });
        if (name) {
            throw {
                status: 409,
                message: { param: 'name', msg: 'Name is already in use' }
            };
        }
        if (req.body.avatar) {
            const bin = await new Buffer(req.body.avatar, 'base64');
            await resizeImg(bin, { width: 128, height: 128 })
                .then((buf) => { newCommunity.avatar = buf; });
            // TODO: resize image with gm
            // await gm(bin, 'img.png')
            //     .resize(128, 128)
            //     .toBuffer('PNG', (err, buffer) => {
            //         if (err) throw new Error(err);
            //         console.log(buffer.length);
            //         newCommunity.avatar = buffer;
            //     });
        } else {
            newCommunity.avatar = await helpers.createAvatar(newCommunity.title);
        }
        if (req.body.banner) {
            const bin = await new Buffer(req.body.banner, 'base64');
            await resizeImg(bin, { width: 800, height: 200 })
                .then((buf) => { newCommunity.banner = buf; });
            // TODO: resize image with gm
            // await gm(bin, 'img.png')
            //     .resize(800, 200)
            //     .toBuffer('PNG', (err, buffer) => {
            //         if (err) throw new Error(err);
            //         console.log(buffer.length);
            //         newCommunity.banner = buffer;
            //     });
        }
        const data = await Community.createCommunity(newCommunity);
        data.avatar = data.avatar.toString('base64');
        if (data.banner) data.banner = data.banner.toString('base64');
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.put('/:cid', ensureAuthenticated, communities, async (req, res, next) => {
    try {
        const com = await Community.isExist({ id: req.params.cid });
        if (!com) throw { status: 404, message: 'Community not found' };
        if (com.admin_id !== req.user && req.body.option !== 'last_post_at') {
            throw { status: 403, message: 'Permission denied' };
        }
        switch (req.body.option) {
            case 'name':
                req.body.value = req.body.value.split(' ').join('_').toLowerCase();
                const name = await Community.isExist({ name: req.body.value });
                if (name) {
                    throw {
                        status: 409,
                        message: { param: 'name', msg: 'Name is already in use' }
                    };
                }
                break;
            case 'title': req.body.value = req.body.value.charAt(0).toUpperCase() +
                req.body.value.slice(1);
                break;
            case 'avatar':
            case 'banner':
                const bin = await new Buffer(req.body.value, 'base64');
                await resizeImg(bin, req.body.option === 'avatar' ?
                    { width: 128, height: 128 } : { width: 800, height: 200 })
                    .then((buf) => { req.body.value = buf; });
                // TODO: resize image with gm
                // await gm(bin, 'img.png')
                //     .resize(128, 128)
                //     .toBuffer('PNG', (err, buffer) => {
                //         if (err) throw new Error(err);
                //         console.log(buffer.length);
                //         req.body.value = buffer;
                //     });
                break;
            case 'active':
                await Subscription.deleteAll(req.params.cid, req.user);
                await Ban.deleteAll(req.params.cid, req.user);
                break;
            default:
        }
        const newCommunity = { [req.body.option]: req.body.value };
        let data = await Community.update(newCommunity, req.params.cid);
        if (req.body.option === ('avatar' || 'banner')) data = data.toString('base64');
        res.status(200).json({
            status: 'success',
            data: { [req.body.option]: data }
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const data = await Community.deleteAllInactive();
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.get('/', communities, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ?
        --req.query.offset : 0;
    const query = req.query.q ? req.query.q.toLowerCase() : null;
    const list = req.query.list ? req.query.list.split(',') : null;
    const admin = req.query.admin || null;
    const profile = req.query.profile || null;
    const mode = req.query.mode || null;
    const limiter = req.query.lim || null;
    const reduced = req.useragent.isMobile || req.query.reduced || false;
    let data;
    try {
        if (list) data = await Community.getAllInList({ list, userId: req.user, limiter });
        else if (query) {
            data = await Community.getAllSearched({ query, userId: req.user, offset, reduced });
        } else if (admin) {
            await ensureAuthenticated;
            switch (mode) {
                case 'count': data = await Community.getAllByProfileCount(admin); break;
                default: data = await Community.getAllByAdmin({ userId: admin, offset, reduced });
            }
        } else if (profile) {
            switch (mode) {
                case 'count': data = await Community.getAllByProfileCount(profile); break;
                case 'feed':
                    await ensureAuthenticated;
                    data = await Community.getAllFeedByProfile(req.user);
                    break;
                default:
                    data = await Community.getAllByProfile({
                        profileId: profile, userId: req.user, offset, reduced
                    });
            }
        } else data = await Community.getAllTrending({ userId: req.user, offset, reduced });
        if (data.communities && data.communities.length > 0) {
            data.communities.forEach((com) => {
                if (com.avatar) com.avatar = com.avatar.toString('base64');
                if (com.banner) com.banner = com.banner.toString('base64');
            });
        }
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});

router.get('/:name', async (req, res, next) => {
    try {
        const data = await Community.getOne(req.params.name, req.user);
        if (!data) throw { status: 404, message: 'Community not found' };
        const ban = await Ban.isExist(data.id, req.user);
        if (ban) throw { status: 403, message: `Ban will end ${ban.end_date}` };
        data.avatar = data.avatar.toString('base64');
        if (data.banner) data.banner = data.banner.toString('base64');
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
