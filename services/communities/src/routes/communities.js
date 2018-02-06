/* eslint-disable consistent-return */
const express = require('express');
const sharp = require('sharp');
const communitiesQueries = require('../db/queries.js');
const validate = require('./validation');
const helpers = require('./_helpers');

const router = express.Router();

/* status */

router.get('/ping', (req, res) => {
    res.send('pong');
});

/* community */

router.post('/', validate.community, async (req, res, next) => {
    const newCommunity = {
        name: req.body.name,
        description: req.body.description,
        avatar: req.body.avatar,
        theme: req.body.theme,
        restricted: req.body.restricted,
        posts_moderation: req.body.posts_moderation,
        admin_id: req.user
    };
    const errors = [];
    try {
        const name = await communitiesQueries.findCommunityByName(newCommunity.name);
        if (name) {
            errors.push({
                param: 'name',
                msg: `Name ${newCommunity.name} is already in use`
            });
            throw new Error(`Name ${newCommunity.name} is already in use`);
        }
        if (newCommunity.avatar === null) {
            newCommunity.avatar = helpers.createAvatar(newCommunity.fullname);
        }
        const community = await communitiesQueries.createCommunity(newCommunity);
        // if (newUserData.name) throw new Error(newUserData.detail || newUserData.message);
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

router.put('/:id', validate.community, async (req, res, next) => {
    const id = req.params.id;
    let data;
    try {
        if (!req.files) {
            const newCommunityData = { [req.body.option]: req.body.value };
            data = await communitiesQueries.updateCommunity(newCommunityData, id, req.user);
        } else if (req.files.avatar) {
            const avatar = await sharp(req.files.avatar.data)
                .resize(100, 100)
                .toBuffer();
            data = await communitiesQueries.updateCommunity({ avatar }, id, req.user);
        } else {
            const theme = await sharp(req.files.theme.data)
                .resize(800, 100)
                .toBuffer();
            data = await communitiesQueries.updateCommunity({ theme }, id, req.user);
        }
        // if (data.name) throw new Error(data.detail || data.message);
        res.status(200).json({
            status: 'success',
            data: !req.files ? data : data.toString('base64')
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:id', validate.community, async (req, res, next) => {
    try {
        const data = await communitiesQueries.deleteCommunity(req.params.id);
        // if (data.name) throw new Error(data.detail || data.message);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/:name', validate.community, async (req, res, next) => {
    const name = req.params.name;
    try {
        const isCommunity = await communitiesQueries.findCommunityByName(name);
        if (!isCommunity) throw new Error(`Community ${name} is not found`);
        const community = await communitiesQueries.getCommunityData(name, req.user);
        // if (communityData.name) throw new Error(communityData.detail || communityData.message);
        // eslint-disable-next-line
        community.avatar = community.avatar.toString('base64');
        // eslint-disable-next-line
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
        const community = await communitiesQueries.findCommunityByName(name);
        if (!community) throw new Error(`Community ${name} is not found`);
        res.status(200).json({
            status: 'success',
            data: community.id
        });
    } catch (err) {
        return next(err);
    }
});

/* subscriptions */

router.post('/:id/follow', validate.subscriptions, async (req, res, next) => {
    const newSubscription = {
        community_id: req.body.id,
        user_id: req.user
    };
    try {
        const data = await communitiesQueries.createSubscription(newSubscription);
        // if (data.name) throw new Error(data.detail || data.message);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:id/follow/:subid', validate.subscriptions, async (req, res, next) => {
    try {
        const data = await communitiesQueries.deleteSubscription(req.params.subid, req.user);
        // if (data.name) throw new Error(data.detail || data.message);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/:id/followers', validate.subscriptions, async (req, res, next) => {
    const id = req.params.id;
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    try {
        const data = await communitiesQueries.getFollowers(id, req.user, offset);
        // if (communityData.name) throw new Error(communityData.detail || communityData.message);
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
//         const data = await communitiesQueries.getFollowinIds(req.user, offset);
//         // if (data.name) throw new Error(data.detail || data.message);
//         res.status(200).json({
//             status: 'success',
//             data
//         });
//     } catch (err) {
//         return next(err);
//     }
// });

/* bans */

router.post('/:id/ban', validate.bans, async (req, res, next) => {
    const newBan = {
        community_id: req.body.id,
        user_id: req.user,
        end_date: req.body.endDate
    };
    try {
        const data = await communitiesQueries.createBan(newBan);
        // if (data.name) throw new Error(data.detail || data.message);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

router.get('/:id/bans', validate.bans, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    const id = req.params.id;
    try {
        const data = await communitiesQueries.getBans(id, req.user, offset);
        // if (data.name) throw new Error(data.detail || data.message);
        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err) {
        return next(err);
    }
});

/* communities */

router.get('/', validate.communities, async (req, res, next) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    const query = req.query.query.toLowerCase() || null;
    const comms = req.query.communities.split(',') || null;
    const admin = req.query.admin || null;
    let data;
    try {
        if (query) data = await communitiesQueries.getSearchedCommunities(query, req.user, offset);
        else if (comms) data = await communitiesQueries.getCommunitiesData(comms, req.user);
        else if (admin) data = await communitiesQueries.getUserCommunities(req.user, offset);
        else data = await communitiesQueries.getTrendingCommunities(req.user, offset);
        // if (data.name) throw new Error(data.detail || data.message);
        /* eslint-disable */
        data.communities.forEach(com => {
            com.avatar = com.avatar.toString('base64');
            com.background = com.background.toString('base64');
        });
        /* eslint-enable */
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
