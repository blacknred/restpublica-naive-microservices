/* eslint-disable consistent-return */
const express = require('express');
const sharp = require('sharp');
const usersQueries = require('../db/queries.js');
const helpers = require('./_helpers');
const validate = require('./validation');

const router = express.Router();

/* status */

router.get('/ping', (req, res) => {
    res.send('pong');
});

/* communities */

router.get('/communityids/:name', usersQueries.ensureAuthenticated,
    validate.validateUserSubscriptions, async (req, res) => {
        try {
            const data = await usersQueries.getFollowinIds(req.params.id);
            if (data.name) throw new Error(data.detail || data.message);
            res.status(200).json({
                status: 'success',
                data
            });
        } catch (err) { 
            return next(err); 
        }
    }
);

router.get('/community/:name', usersQueries.ensureAuthenticated,
    validate.validateCommunities, async (req, res) => {
        const name = req.params.name;
        try {
            const isCommunity = await usersQueries.findCommunityByName(name);
            if (!isCommunity) throw new Error(`Name ${name} is not in use`);
            const communityData = await usersQueries.getCommunityData(name, req.user);
            if (communityData.name) throw new Error(communityData.detail || communityData.message);
            // eslint-disable-next-line
            communityData.avatar = communityData.avatar.toString('base64');
            // eslint-disable-next-line
            communityData.background = communityData.background.toString('base64');
            res.status(200).json({
                status: 'success',
                data: communityData
            });
        } catch (err) {
            res.status(500).json({
                status: 'error',
                message: err.message
            });
        }
    }
);

router.get('/communities/trending', usersQueries.ensureAuthenticated, async (req, res) => {
    const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
    try {
        const tCommunities = await usersQueries.getTrendingCommunities(offset, req.user);
        if (tCommunities.name) throw new Error(tCommunities.detail || tCommunities.message);
        // eslint-disable-next-line
        tCommunities.communities.forEach(com => com.avatar = com.avatar.toString('base64'));
        // eslint-disable-next-line
        tCommunities.communities.forEach(com => com.background = com.background.toString('base64'));
        res.status(200).json({
            status: 'success',
            data: tCommunities
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
});

router.get('/communities/search/:query', usersQueries.ensureAuthenticated,
    validate.validateSearch, async (req, res) => {
        const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
        try {
            const query = (req.params.query).toLowerCase();
            const sCommunities = await usersQueries.getSearchedCommunities(query, offset, req.user);
            if (sCommunities.name) throw new Error(sCommunities.detail || sCommunities.message);
            // eslint-disable-next-line
            sCommunities.communities.forEach(com => com.avatar = com.avatar.toString('base64'));
            // eslint-disable-next-line
            sCommunities.communities.forEach(com => com.background = com.background.toString('base64'));

            const sPosts = await helpers.getUsersPosts(sUsers.users.map(u => u.user_id));
            if (sUsers.count > 0 && !sPosts) throw new Error(`Users posts not fetched`);
            // eslint-disable-next-line
            sUsers.users.forEach(x => x.posts = sPosts.find(y => y.user_id == x.user_id));
            res.status(200).json({
                status: 'success',
                data: sCommunities
            });
        } catch (err) {
            res.status(500).json({
                status: 'error',
                message: err.message
            });
        }
    }
);



router.get('/communities/:userid', usersQueries.ensureAuthenticated,
    validate.validateUserSubscriptions, async (req, res) => {
        const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset) ? --req.query.offset : 0;
        try {
            const data = await usersQueries.getFollowers(req.params.id, offset, req.user);
            if (data.name) throw new Error(data.detail || data.message);
            // eslint-disable-next-line
            data.subscriptions.forEach(u => u.avatar = u.avatar.toString('base64'));
            res.status(200).json({
                status: 'success',
                data
            });

        } catch (err) {
            res.status(500).json({
                status: 'error',
                message: err.message
            });
        }
    }
);

/* communities subscriptions */

router.post('/communities/subscription', usersQueries.ensureAuthenticated,
    validate.validateUserSubscriptions, async (req, res) => {
        const newSubscription = {
            user_id: req.body.userId,
            sub_user_id: req.user
        };
        try {
            const data = await usersQueries.createSubscription(newSubscription);
            if (data.name) throw new Error(data.detail || data.message);
            res.status(200).json({
                status: 'success',
                data
            });
        } catch (err) {
            res.status(500).json({
                status: 'error',
                message: err.message
            });
        }
    }
);

router.delete('/communities/subscription/:id', usersQueries.ensureAuthenticated,
    validate.validateUserSubscriptions, async (req, res) => {
        try {
            const data = await usersQueries.deleteSubscription(req.params.id, req.user);
            if (data.name) throw new Error(data.detail || data.message);
            res.status(200).json({
                status: 'success',
                data
            });
        } catch (err) {
            res.status(500).json({
                status: 'error',
                message: err.message
            });
        }
    }
);


module.exports = router;
