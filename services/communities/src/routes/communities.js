/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */

// const gm = require('gm');
const express = require('express');
const resizeImg = require('resize-img');
const Community = require('../db/models/Community');
const { communities } = require('./validation');
const helpers = require('./_helpers');

const router = express.Router();

/* communities */

router.post('/', communities, async (req, res, next) => {
    const newCommunity = {
        name: req.body.name.split(' ').join('_').toLowerCase(),
        title: req.body.title.charAt(0).toUpperCase() +
            req.body.title.slice(1),
        description: req.body.description,
        restricted: req.body.restricted,
        posts_moderation: req.body.posts_moderation,
        admin_id: req.user
    };
    try {
        if (req.body.avatar) {
            const bin = await new Buffer(req.body.avatar, 'base64');
            await resizeImg(bin, { width: 128, height: 128 })
                .then(buf => newCommunity.avatar = buf);
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
                .then(buf => newCommunity.banner = buf);
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
        if (data.banner) data.bunner = data.banner.toString('base64');
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
    let isFile = false;
    let data;
    try {
        /* eslint-disable */
        switch (req.body.option) {
            case 'avatar':
            case 'banner':
                isFile = true;
                const bin = await new Buffer(req.body.value, 'base64');
                await resizeImg(bin,
                    req.body.option === 'avatar' ? { width: 128, height: 128 } :
                        { width: 800, height: 200 }
                )
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
            case 'active':
                await Community.deleteSubscriptions(id, req.user);
                await Community.deleteBans(id, req.user);
                break;
            case 'name': req.body.value.split(' ').join('_').toLowerCase(); break;
            case 'title': req.body.value.charAt(0).toUpperCase() +
                req.body.value.slice(1); break;
            default:
        }
        /* eslint-enable */
        const newCommunityData = { [req.body.option]: req.body.value };
        data = await Community.updateCommunity(newCommunityData, id, req.user);
        if (isFile) data = data.toString('base64');
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
        const data = await Community.deleteCommunities();
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/', communities, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    const query = req.query.query ? req.query.query.toLowerCase() : null;
    const list = req.query.list ? req.query.list.split(',') : null;
    const profile = req.query.profile || null;
    const admin = req.query.admin || null;
    const lim = req.query.lim || null;
    let data;
    try {
        if (query) data = await Community.getSearchedCommunities(query, req.user, offset);
        else if (list) data = await Community.getCommunities(list, req.user);
        else if (admin) data = await Community.getCommunitiesByAdmin(req.user, offset);
        else if (profile) data = await Community.getUserCommunities(profile, req.user, lim, offset);
        else data = await Community.getTrendingCommunities(req.user, offset);
        if (!lim) {
            data.communities.forEach((com) => {
                com.avatar = com.avatar.toString('base64');
                if (com.banner) com.banner = com.banner.toString('base64');
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
    const lim = req.query.lim || null;
    try {
        const isExist = await Community.findCommunityByName(name);
        if (!isExist) throw new Error(`Community ${name} is not found`);
        const data = await Community.getCommunity(name, lim, req.user);
        if (!lim) {
            data.avatar = data.avatar.toString('base64');
            if (data.banner) data.banner = data.banner.toString('base64');
        }
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
