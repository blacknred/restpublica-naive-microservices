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
        if (req.body.communityId) {
            req.checkBody('communityId')
                .isInt()
                .withMessage('Community id must be integer');
        }
        if (req.body.tags) {
            req.checkBody('tags')
                .matches(/[0-9a-zA-Z]+/g)
                .withMessage('Tags must be alphanumeric');
        }
        switch (req.body.contentType) {
            case 'imgs' || 'video':
                if (!req.files) {
                    return res.status(422)
                        .json({ status: `Validation failed`, failures: 'No file was uploaded' });
                }
                break;
            case 'link':
                if (!JSON.parse(req.body.link).link
                    .match(/^(http[s]?:\/\/)?[^\s(["<,>]*\.[^\s[",><]*$/igm)) {
                    return res.status(422)
                        .json({ status: `Validation failed`, failures: 'No link was found' });
                }
                break;
            case 'poll':
                if (!(JSON.parse(req.body.poll).subject.length > 0 &&
                Object.keys(JSON.parse(req.body.poll).options).length > 1)) {
                    return res.status(422)
                        .json({ status: `Validation failed`, failures: 'Poll is incorrect' });
                }
                break;
            default:
                return res.status(422)
                    .json({ status: `Validation failed`, failures: 'Content type is incorrect' });
        }
    } else if (req.method === 'PUT') {
        req.checkParams('id')
            .isInt()
            .withMessage('Post id must be integer');
        req.checkBody('description')
            .notEmpty()
            .withMessage('Comment cannot be empty');


    } else if (req.method === 'DELETE') {
        req.checkParams('id')
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
        req.checkParams('id')
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
        req.checkParams('commid')
            .isInt()
            .withMessage('Comment id must be integer');
        req.checkBody('comment')
            .notEmpty()
            .withMessage('Comment cannot be empty');
    } else if (req.method === 'DELETE') {
        req.checkParams('commid')
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
        req.checkParams('id')
            .isInt()
            .withMessage('Post id must be integer');
    } else if (req.method === 'POST') {
        req.checkBody('id')
            .isInt()
            .withMessage('Post id must be integer');
    } else if (req.method === 'DELETE') {
        req.checkParams('likeid')
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
