function post(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('slug')
            .notEmpty()
            .withMessage('Post slug cannot be empty');
    } else if (req.method === 'POST') {
        req.checkBody('commentable')
            .isIn([true, false])
            .withMessage('Commentable should be bool');
        req.checkBody('archived')
            .isIn([true, false])
            .withMessage('Archived should be bool');
        req.checkBody('communityId')
            .matches(/^(\d+|)$/)
            .withMessage('Community id must be integer or empty');
        req.checkBody('description')
            .exists()
            .withMessage('Post must have description');
        req.checkBody('tags')
            .matches(/^$|#[0-9a-zA-Z]+/g)
            .withMessage('Tags must be alphanumeric or empty');
        req.checkBody('type')
            .not().isIn(['file', 'link', 'poll'])
            .withMessage('Post type is not in use')
            .custom((value) => {
                function exists(val) {
                    return typeof val !== 'undefined' && val !== null;
                }
                function url(val) {
                    return val.match(/^(http[s]?:\/\/)?[^\s(["<,>]*\.[^\s[",><]*$/igm);
                }
                if (value === 'file') {
                    if (!exists(req.body.fileType) ||
                        !req.body.fileType.match(/^(img|gif|video)+$/g)) {
                        throw new Error('File type is empty or incorrect');
                    } else if (Object.keys(req.files).length === 0) {
                        throw new Error('No file was uploaded');
                    }
                } else if (value === 'poll') {
                    if (!exists(req.body.pollSubject)) {
                        throw new Error('Poll subject is missed or empty');
                    }
                    if (exists(req.body.pollEndsAt) &&
                        !isNaN(req.body.pollEndsAt) && isNaN(Date.parse(req.body.pollEndsAt))) {
                        throw new Error('Poll endsAt is not a Date');
                    }
                    if (!exists(req.body.pollOptions)) {
                        throw new Error('Poll options are missed or empty');
                    } else {
                        const pollOptions = Object.keys(JSON.parse(req.body.pollOptions));
                        if (pollOptions.length < 2) throw new Error('Poll must have atleast 2 options');
                        else {
                            pollOptions.forEach((opt) => {
                                if (!exists(pollOptions[opt]) || !exists(req.files[opt])) {
                                    throw new Error('Poll option is incorrect');
                                }
                            });
                        }
                    }
                } else {
                    if (!exists(req.body.linkType) && req.body.linkType.match(/^(embed|file|page)+$/g)) {
                        throw new Error('Link src is missed or empty');
                    }
                    if (!url(req.body.linkUrl)) throw new Error('Link url is missed or empty');
                    if (!exists(req.body.linkSrc)) throw new Error('Link src is missed or empty');
                    if (exists(req.body.linkThumb) && !url(req.body.linkThumb)) {
                        throw new Error('Link src is missed or empty');
                    }
                }
            });
    } else if (req.method === 'PUT') {
        req.checkParams('pid')
            .isInt()
            .withMessage('Post id must be integer');
        req.checkBody('description')
            .notEmpty()
            .withMessage('Comment cannot be empty');
    } else if (req.method === 'DELETE') {
        req.checkParams('pid')
            .isInt()
            .withMessage('Post id must be integer');
    }
    const failures = req.validationErrors();
    if (failures) {
        return res.status(422)
            .json({ message: `Validation failed`, failures });
    }
    return next();
}

function comments(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('pid')
            .isInt()
            .withMessage('Post id must be integer');
    } else if (req.method === 'POST') {
        req.checkBody('id')
            .isInt()
            .withMessage('Post id must be integer');
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
    if (failures) {
        return res.status(422)
            .json({ message: `Validation failed`, failures });
    }
    return next();
}

function likes(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('pid')
            .isInt()
            .withMessage('Post id must be integer');
    } else if (req.method === 'POST') {
        req.checkBody('id')
            .isInt()
            .withMessage('Post id must be integer');
    } else if (req.method === 'DELETE') {
        req.checkParams('lid')
            .isInt()
            .withMessage('Like id must be integer');
    }
    const failures = req.validationErrors();
    if (failures) {
        return res.status(422)
            .json({ message: `Validation failed`, failures });
    }
    return next();
}

function tags(req, res, next) {
    if (req.method === 'GET') {
        req.checkQuery('query')
            .matches(/^.{3,}$/)
            .withMessage('Search query must has at least 3 chars');
    }
    const failures = req.validationErrors();
    if (failures) {
        return res.status(422)
            .json({ message: `Validation failed`, failures });
    }
    return next();
}

function posts(req, res, next) {
    if (req.query.query) {
        req.checkQuery('query')
            .matches(/^.{3,}$/)
            .withMessage('Search query must has at least 3 chars');
    }
    if (req.query.query) {
        req.checkQuery('tag')
            .notEmpty()
            .withMessage('Tag cannot be empty');
    }
    if (req.query.communities) {
        req.checkQuery('communities')
            .matches(/[0-9]+/g)
            .withMessage('Communities ids must be integers');
    }
    if (req.query.profiles) {
        req.checkQuery('profiles')
            .matches(/[0-9]+/g)
            .withMessage('Profiles ids must be integers');
    }
    const failures = req.validationErrors();
    if (failures) {
        return res.status(422)
            .json({ status: `Validation failed`, failures });
    }
    return next();
}

module.exports = {
    post,
    comments,
    likes,
    tags,
    posts
};
