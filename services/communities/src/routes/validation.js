/* eslint-disable no-throw-literal */

const moment = require('moment');

const BASE64PATTERN = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

function communities(req, res, next) {
    if (req.method === 'GET') {
        if (req.query.q) {
            req.checkQuery('q')
                .isLength({ min: 2 })
                .withMessage('Search query must have at least 2 chars')
                .matches(/^[a-zA-Z0-9]+$/)
                .withMessage('Search query must have be alphanumeric');
        }
        if (req.query.list) {
            req.checkQuery('list')
                .matches(/^[0-9,]+$/g)
                .withMessage('List ids must be integer');
        }
        if (req.query.profile) {
            req.checkQuery('profile')
                .isInt()
                .withMessage('Profile id must be integer');
        }
        if (req.query.admin) {
            req.checkQuery('admin')
                .isInt()
                .withMessage('Admin id must be integer');
        }
        if (req.query.lim) {
            req.checkQuery('lim')
                .isIn(['id', 'name', 'title', 'avatar'])
                .withMessage('Limiter must be valid');
        }
        if (req.query.mode) {
            req.checkQuery('mode')
                .isIn(['count', 'dashboard'])
                .withMessage('Mode must be valid');
        }
    } else if (req.method === 'POST') {
        req.checkBody('name')
            .notEmpty()
            .withMessage('Name cannot be empty');
        req.checkBody('title')
            .notEmpty()
            .withMessage('Title cannot be empty');
        req.checkBody('description')
            .notEmpty()
            .withMessage('Description cannot be empty');
        req.checkBody('restricted')
            .isBoolean()
            .withMessage('Restricted should be boolean');
        req.checkBody('posts_moderation')
            .isBoolean()
            .withMessage('Posts moderation should be boolean');
        if (req.body.avatar) {
            req.checkBody('avatar')
                .custom(value => value.replace(/\n/g, '').match(BASE64PATTERN))
                .withMessage('Avatar value must be base64');
        }
        if (req.body.banner) {
            req.checkBody('banner')
                .custom(value => value.replace(/\n/g, '').match(BASE64PATTERN))
                .withMessage('Banner value must be base64');
        }
    } else if (req.method === 'PUT') {
        req.checkParams('cid')
            .isInt()
            .withMessage('Id must be integer');
        req.checkBody('option')
            .isIn(['name', 'title', 'banner', 'description', 'active', 'avatar',
                'restricted', 'posts_moderation', 'last_post_at'])
            .withMessage('Option is not valid');
        req.checkBody('value')
            .notEmpty()
            .withMessage('Update value cannot be empty');
        if (req.body.option && req.body.value) {
            switch (req.body.option) {
                case 'avatar':
                case 'banner':
                    req.checkBody('value')
                        .custom(value => value.replace(/\n/g, '').match(BASE64PATTERN))
                        .withMessage(`${req.body.option} value must be base64`);
                    break;
                case 'restricted':
                case 'active':
                case 'posts_moderation':
                    req.checkBody('value')
                        .isBoolean()
                        .withMessage(`${req.body.option} value should be boolean`);
                    break;
                case 'last_post_at':
                    req.checkBody('value')
                        .custom(date => moment(date, moment.ISO_8601, true).isValid())
                        .withMessage('Last post date value must be valid');
                    break;
                default:
            }
        }
    }
    const failures = req.validationErrors();
    if (failures) throw { status: 422, message: failures };
    return next();
}

function subscriptions(req, res, next) {
    req.checkParams('cid')
        .isInt()
        .withMessage('Community id must be integer');
    if (req.method === 'DELETE') {
        req.checkParams('sid')
            .isInt()
            .withMessage('Subscription id must be integer');
    }
    const failures = req.validationErrors();
    if (failures) throw { status: 422, message: failures };
    return next();
}

function bans(req, res, next) {
    req.checkParams('cid')
        .isInt()
        .withMessage('Community id must be integer');
    if (req.method === 'POST') {
        req.checkBody('end_date')
            .custom(date => moment(date, moment.ISO_8601, true).isValid())
            .withMessage('End date must be valid');
    }
    const failures = req.validationErrors();
    if (failures) throw { status: 422, message: failures };
    return next();
}

module.exports = {
    communities,
    subscriptions,
    bans
};
