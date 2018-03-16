/* eslint-disable */
function posts(req, res, next) {
    if (req.method === 'POST') {
        req.checkBody('commentable').isBoolean().withMessage('Commentable must be bool');
        req.checkBody('archived').isBoolean().withMessage('Archived must be bool');
        if (req.body.communityId) {
            req.checkBody('communityId').isInt().withMessage('Community id must be integer');
        }
        req.checkBody('description').notEmpty().withMessage('Post must have description');
        if (req.body.tags) {
            req.checkBody('tags')
                .matches(/^#[0-9a-zA-Z]+/g).withMessage('Tags must be alphanumeric');
        }
        req.checkBody('type')
            .isIn(['file', 'link', 'poll']).withMessage('Post type is empty or not in use');
        switch (req.body.type) {
            case 'file':
                req.checkBody('fileType')
                    .isIn(['img', 'gif', 'video']).withMessage('File type is empty or not valid');
                req.checkBody('fileUrl').isURL().withMessage('File url is empty or not valid');
                req.checkBody('fileThumbUrl').isURL().withMessage('Thumb url is empty or not valid');
                break;
            case 'link':
                req.checkBody('linkType')
                    .isIn(['embed', 'file', 'page']).withMessage('Link type is empty or not valid');
                req.checkBody('linkUrl').isURL().withMessage('Link url is empty or not valid');
                req.checkBody('linkSrc').notEmpty().withMessage('Link src is empty');
                if (req.body.linkThumbUrl) {
                    req.checkBody('linkThumbUrl')
                        .isURL().withMessage('Thumb url is empty or not valid');
                }
                break;
            case 'poll':
                req.checkBody('pollSubject').notEmpty().withMessage('Poll subject is empty');
                req.checkBody('pollEndsAt')
                .isAfter().withMessage('Poll end date is empty or not valid');
                req.checkBody('pollOptions')
                    .custom(values => JSON.parse(values || '[]').length >= 2)
                    .withMessage('Poll must have at least 2 options');
                break;
            default:
        }
    } else if (req.method === 'GET') {
        if (req.query.query) {
            req.checkQuery('query')
                .isLength({ min: 3 }).withMessage('Search query must have at least 3 chars');
        }
        if (req.query.tag) {
            req.checkQuery('tag').isAlphanumeric().withMessage('Tag must be alphanumeric');
        }
        if (req.query.communities) {
            req.checkQuery('communities')
                .matches(/^[0-9,]+$/g).withMessage('Communities ids must be integers');
        }
        if (req.query.profiles) {
            req.checkQuery('profiles')
                .matches(/^[0-9,]+$/g).withMessage('Profiles ids must be integers');
        }
        if (req.query.community) {
            req.checkQuery('community').isInt().withMessage('Community id must be integer');
        }
        if (req.query.profile) {
            req.checkQuery('profile').isInt().withMessage('Profile id must be integer');
        }
        if (req.query.lim) {
            req.checkQuery('lim').isIn(['count']).withMessage('Limiter must be valid');
        }
    } else if (req.method === 'PUT') {
        req.checkParams('pid').isInt().withMessage('Post id must be integer');
        req.checkBody('description').notEmpty().withMessage('Comment cannot be empty');
    } else if (req.method === 'DELETE') {
        req.checkParams('pid').isInt().withMessage('Post id must be integer');
    }
    const failures = req.validationErrors();
    if (failures) return res.status(422).json({ message: `Validation failed`, failures });
    return next();
}

function comments(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('pid').isInt().withMessage('Post id must be integer');
    } else if (req.method === 'POST') {
        req.checkBody('id').isInt().withMessage('Post id must be integer');
        req.checkBody('comment').notEmpty().withMessage('Comment cannot be empty');
    } else if (req.method === 'PUT') {
        req.checkParams('cid').isInt().withMessage('Comment id must be integer');
        req.checkBody('comment').notEmpty().withMessage('Comment cannot be empty');
    } else if (req.method === 'DELETE') {
        req.checkParams('cid').isInt().withMessage('Comment id must be integer');
    }
    const failures = req.validationErrors();
    if (failures) return res.status(422).json({ message: `Validation failed`, failures });
    return next();
}

function likes(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('pid').isInt().withMessage('Post id must be integer');
    } else if (req.method === 'POST') {
        req.checkBody('id').isInt().withMessage('Post id must be integer');
    } else if (req.method === 'DELETE') {
        req.checkParams('lid').isInt().withMessage('Like id must be integer');
    }
    const failures = req.validationErrors();
    if (failures) return res.status(422).json({ message: `Validation failed`, failures });
    return next();
}

function tags(req, res, next) {
    if (req.method === 'GET') {
        req.checkQuery('query')
            .isLength({ min: 3 }).withMessage('Search query must have at least 3 chars');
    }
    const failures = req.validationErrors();
    if (failures) return res.status(422).json({ message: `Validation failed`, failures });
    return next();
}

module.exports = {
    posts,
    comments,
    likes,
    tags
};
