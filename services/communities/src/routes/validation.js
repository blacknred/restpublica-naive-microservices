function community(req, res, next) {
    if (req.method === 'POST') {
        req.checkBody('name')
            .notEmpty()
            .withMessage('Name cannot be empty');
        req.checkBody('description')
            .notEmpty()
            .withMessage('Description cannot be empty');
        req.checkBody('restricted')
            .isIn([true, false])
            .withMessage('Restricted should be bool');
        req.checkBody('posts_moderation')
            .isIn([true, false])
            .withMessage('Posts moderation should be bool');
    } else if (req.method === 'PUT') {
        req.checkParams('cid')
            .isInt()
            .withMessage('Id must be integer');
        if (!req.files) {
            req.checkBody('option')
                .notEmpty()
                .withMessage('Update option cannot be empty');
            req.checkBody('value')
                .notEmpty()
                .withMessage('Update value cannot be empty');
        } else if (!req.files.avatar && !req.files.theme) {
            return res.status(422)
                .json({ status: `Validation failed`, failures: 'No image was uploaded' });
        }
    } else if (req.method === 'DELETE') {
        req.checkParams('cid')
            .isInt()
            .withMessage('Id must be integer');
        req.checkBody('option')
            .notEmpty()
            .withMessage('Update option cannot be empty');
        req.checkBody('value')
            .notEmpty()
            .withMessage('Update value cannot be empty');
    }
    const failures = req.validationErrors();
    if (failures) {
        return res.status(422)
            .json({ status: `Validation failed`, failures });
    }
    return next();
}

function communities(req, res, next) {
    if (req.query.query) {
        req.checkQuery('query')
            .matches(/^.{3,}$/)
            .withMessage('Search query must has at least 3 chars');
    }
    if (req.query.communities) {
        req.checkQuery('communities')
            .matches(/[0-9]+/g)
            .withMessage('Communities ids must be integers');
    }
    if (req.query.admin) {
        req.checkQuery('admin')
            .isInt()
            .withMessage('Admin id must be integer');
    }
    const failures = req.validationErrors();
    if (failures) {
        return res.status(422)
            .json({ status: `Validation failed`, failures });
    }
    return next();
}

function bans(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('cid')
            .notEmpty()
            .withMessage('Community id cannot be empty');
    } else if (req.method === 'POST') {
        req.checkBody('id')
            .isInt()
            .withMessage('Id must be integer');
        req.checkBody('endDate')
            .notEmpty()
            .withMessage('endDate value cannot be empty');
    }
    const failures = req.validationErrors();
    if (failures) {
        return res.status(422)
            .json({ status: `Validation failed`, failures });
    }
    return next();
}

function subscriptions(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('sid')
            .isInt()
            .withMessage('Community id must be integer');
    } else if (req.method === 'POST') {
        req.checkBody('id')
            .isInt()
            .withMessage('Community id must be integer');
    } else if (req.method === 'DELETE') {
        req.checkParams('sid')
            .isInt()
            .withMessage('Subscription id must be integer');
    }
    const failures = req.validationErrors();
    if (failures) {
        return res.status(422)
            .json({ status: `Validation failed`, failures });
    }
    return next();
}

module.exports = {
    community,
    bans,
    subscriptions,
    communities
};
