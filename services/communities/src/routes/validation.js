const queries = require('../db/queries.js');

function communities(req, res, next) {
    if (req.method === 'GET') {
        if (req.query.query) {
            req.checkQuery('query')
                .isLength({ min: 3 }).withMessage('Search query must have at least 3 chars');
        }
        if (req.query.list) {
            req.checkQuery('list').matches(/^[0-9,]+$/g).withMessage('List ids must be integer');
        }
        if (req.query.profile) {
            req.checkQuery('profile').isInt().withMessage('Profile id must be integer');
        }
        if (req.query.lim) {
            req.checkQuery('lim').isIn(['id', 'name']).withMessage('Limiter must be valid');
        }
    } else if (req.method === 'POST') {
        req.checkBody('name').notEmpty().withMessage('Name cannot be empty');
        req.checkBody('title').notEmpty().withMessage('Title cannot be empty');
        req.checkBody('description').notEmpty().withMessage('Description cannot be empty');
        req.checkBody('restricted').isBoolean().withMessage('Restricted should be boolean');
        req.checkBody('posts_moderation')
            .isBoolean().withMessage('Posts moderation should be boolean');
        req.checkBody('username').custom((value) => {
            return queries.findCommunityByName(value)
                .then((community) => {
                    if (community) throw new Error(`Community ${value} is already in use`);
                });
        });
    } else if (req.method === 'PUT') {
        req.checkParams('cid').isInt().withMessage('Id must be integer');
        req.checkBody('option')
            .isIn(['name', 'title', 'banner', 'description', 'active', 'avatar',
                'restricted', 'posts_moderation'])
            .withMessage('Option is not valid');
        req.checkBody('value').notEmpty().withMessage('Update value cannot be empty');
    }
    const failures = req.validationErrors();
    if (failures) return res.status(422).json({ status: `Validation failed`, failures });
    return next();
}

function subscriptions(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('cid').isInt().withMessage('Community id must be integer');
    } else if (req.method === 'POST') {
        req.checkBody('id').isInt().withMessage('Community id must be integer');
    } else if (req.method === 'DELETE') {
        req.checkParams('sid').isInt().withMessage('Subscription id must be integer');
    }
    const failures = req.validationErrors();
    if (failures) return res.status(422).json({ status: `Validation failed`, failures });
    return next();
}

function bans(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('cid').notEmpty().withMessage('Community id cannot be empty');
    } else if (req.method === 'POST') {
        req.checkBody('id').isInt().withMessage('Community id must be integer');
    }
    const failures = req.validationErrors();
    if (failures) return res.status(422).json({ status: `Validation failed`, failures });
    return next();
}

module.exports = {
    communities,
    subscriptions,
    bans
};
