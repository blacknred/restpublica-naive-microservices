/* eslint-disable no-throw-literal */

function posts(req, res, next) {
    const URLPATTERN = /[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
    // const FILEURLPATTERN = /(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|mp4))/;
    if (req.method === 'POST') {
        req.checkBody('commentable')
            .isBoolean()
            .withMessage('Commentable must be bool');
        req.checkBody('archived')
            .isBoolean()
            .withMessage('Archived must be bool');
        req.checkBody('type')
            .isIn(['text', 'file', 'link', 'poll', 'repost'])
            .withMessage('Post type is empty or not in use');
        if (req.body.communityId) {
            req.checkBody('communityId')
                .isInt()
                .withMessage('Community id must be integer');
        }
        switch (req.body.type) {
            case 'file':
                req.checkBody('filesType')
                    .isIn(['img', 'gif', 'video'])
                    .withMessage('File type is empty or not valid');
                req.checkBody('files')
                    .custom(values => values.some(val =>
                        val.file && val.file.match(URLPATTERN) &&
                        val.thumb && val.thumb.match(URLPATTERN)))
                    .withMessage('File links are empty or not valid');
                break;
            case 'link':
                req.checkBody('link')
                    .matches(URLPATTERN)
                    .withMessage('Link url is empty or not valid');
                req.checkBody('linkType')
                    .isIn(['embed', 'file', 'page'])
                    .withMessage('Link type is empty or not valid');
                req.checkBody('linkSrc')
                    .notEmpty()
                    .withMessage('Link src must be not empty');
                // if (req.body.linkImg) {
                //     req.checkBody('linkImg')
                //         .matches(FILEURLPATTERN)
                //         .withMessage('Link img is empty or not valid');
                // }
                break;
            case 'poll':
                req.checkBody('pollAnswers')
                    .custom(values => values.length > 1 &&
                        values.some(val => val.text &&
                            typeof val.img !== 'undefined' &&
                            typeof val.thumb !== 'undefined'))
                    .withMessage('Poll answer variants are empty or not valid');
                if (req.body.pollEndsAt) {
                    req.checkBody('pollEndsAt')
                        .isAfter()
                        .withMessage('Poll end date is empty or not valid');
                }
                break;
            case 'repost':
                req.checkBody('repostedId')
                    .isInt()
                    .withMessage('Repost must have reposted post id');
                break;
            default:
        }
    } else if (req.method === 'GET') {
        if (req.query.q) {
            req.checkQuery('q')
                // .isLength({ min: 2 })
                // .withMessage('Search query must have at least 2 chars')
                .matches(/^[a-zA-Z0-9]+$/)
                .withMessage('Search query must have be alphanumeric');
        }
        if (req.query.tag) {
            req.checkQuery('tag')
                .isAlphanumeric()
                .withMessage('Tag must be alphanumeric');
        }
        if (req.query.community) {
            req.checkQuery('community')
                .isInt()
                .withMessage('Community id must be integer');
        }
        if (req.query.profile) {
            req.checkQuery('profile')
                .isInt()
                .withMessage('Profile id must be integer');
        }
        if (req.query.profiles) {
            req.checkQuery('profiles')
                .matches(/^[0-9,]+$/g)
                .withMessage('Profiles id must be integers');
        }
        if (req.query.communities) {
            req.checkQuery('communities')
                .matches(/^[0-9,]+$/g)
                .withMessage('Communities id must be integers');
        }
        if (req.query.mode) {
            req.checkQuery('mode')
                .isIn(['count'])
                .withMessage('Mode must be valid');
        }
    } else if (req.method === 'PUT') {
        req.checkParams('pid')
            .isInt()
            .withMessage('Post id must be integer');
        req.checkBody('option')
            .isIn(['commentable', 'archived', 'description'])
            .withMessage('Option is not valid');
        if (req.body.option !== 'description') {
            req.checkBody('value')
                .notEmpty()
                .withMessage('Update value cannot be empty');
        }
        if (req.body.option && req.body.value) {
            switch (req.body.option) {
                case 'commentable':
                case 'archived':
                    req.checkBody('value')
                        .isBoolean()
                        .withMessage('Updated value must be boolean');
                    break;
                default:
            }
        }
    } else if (req.method === 'DELETE') {
        req.checkParams('pid').isInt().withMessage('Post id must be integer');
    }
    const failures = req.validationErrors();
    if (failures) throw { status: 422, message: failures };
    return next();
}

function comments(req, res, next) {
    req.checkParams('pid')
        .isInt()
        .withMessage('Post id must be integer');
    if (req.method === 'POST') {
        req.checkBody('comment')
            .notEmpty()
            .withMessage('Comment cannot be empty');
    } else if (req.method === 'PUT') {
        req.checkParams('cid')
            .isInt()
            .withMessage('Comment id must be integer');
        req.checkBody('comment')
            .notEmpty()
            .withMessage('Comment cannot be empty');
    } else if (req.method === 'DELETE') {
        req.checkParams('cid')
            .isInt()
            .withMessage('Comment id must be integer');
    }
    const failures = req.validationErrors();
    if (failures) throw { status: 422, message: failures };
    return next();
}

function likes(req, res, next) {
    req.checkParams('pid')
        .isInt()
        .withMessage('Post id must be integer');
    if (req.method === 'POST') {
        req.checkBody('userId')
            .isInt()
            .withMessage('User id must be integer');
    }
    const failures = req.validationErrors();
    if (failures) throw { status: 422, message: failures };
    return next();
}

function votes(req, res, next) {
    req.checkParams('pid')
        .isInt()
        .withMessage('Post id must be integer');
    if (req.method === 'POST') {
        req.checkBody('optionId')
            .isInt()
            .withMessage('Option id must be integer');
        req.checkBody('userId')
            .isInt()
            .withMessage('User id must be integer');
    } else if (req.method === 'DELETE') {
        req.checkParams('oid')
            .isInt()
            .withMessage('Option id must be integer');
    }
    const failures = req.validationErrors();
    if (failures) throw { status: 422, message: failures };
    return next();
}

function tags(req, res, next) {
    if (req.method === 'GET') {
        if (req.query.q) {
            req.checkQuery('q')
                // .isLength({ min: 2 })
                // .withMessage('Search query must have at least 2 chars')
                .matches(/^[a-zA-Z0-9]+$/)
                .withMessage('Search query must have be alphanumeric');
        }
    }
    const failures = req.validationErrors();
    if (failures) throw { status: 422, message: failures };
    return next();
}

module.exports = {
    posts,
    comments,
    likes,
    votes,
    tags
};
