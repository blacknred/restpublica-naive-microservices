function validatePost(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('id')
            .notEmpty()
            .withMessage('Id cannot be empty')
            .isInt()
            .withMessage('Id must be integer');
    } else if (req.method === 'POST') {
        req.checkBody('id', 'Must be valid')
            .notEmpty()
            .isInt();
    } else if (req.method === 'PUT') {
        req.checkBody('comment')
            .notEmpty()
            .withMessage('Comment cannot be empty');
    } else if (req.method === 'DELETE') {
        req.checkParams('id')
            .notEmpty()
            .withMessage('Id cannot be empty')
            .isInt()
            .withMessage('Id must be integer');
    }
    const errors = req.validationErrors();
    if (errors) {
        return res.status(400)
            .json({ message: `Validation failed`, failures: errors });
    }
    return next();
}

function validateComments(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('id')
            .notEmpty()
            .withMessage('Id cannot be empty')
            .isInt()
            .withMessage('Id must be integer');
    } else if (req.method === 'POST') {
        req.checkParams('id')
            .notEmpty()
            .withMessage('Id cannot be empty')
            .isInt()
            .withMessage('Id must be integer');
        req.checkBody('comment')
            .notEmpty()
            .withMessage('Comment cannot be empty');
    } else if (req.method === 'PUT') {
        req.checkBody('comment')
            .notEmpty()
            .withMessage('Comment cannot be empty');
    } else if (req.method === 'DELETE') {
        req.checkParams('id')
            .notEmpty()
            .withMessage('Id cannot be empty')
            .isInt()
            .withMessage('Id must be integer');
    }
    const errors = req.validationErrors();
    if (errors) {
        return res.status(400)
            .json({ message: `Validation failed`, failures: errors });
    }
    return next();
}

function validateLikes(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('id')
            .notEmpty()
            .withMessage('Id cannot be empty')
            .isInt()
            .withMessage('Id must be integer');
    } else if (req.method === 'POST') {
        req.checkBody('postId')
            .notEmpty()
            .withMessage('Post id cannot be empty')
            .isInt()
            .withMessage('Post id must be integer');
    } else if (req.method === 'DELETE') {
        req.checkParams('id')
            .notEmpty()
            .withMessage('Id cannot be empty')
            .isInt()
            .withMessage('Id must be integer');
    }
    const errors = req.validationErrors();
    if (errors) {
        return res.status(400)
            .json({ message: `Validation failed`, failures: errors });
    }
    return next();
}

module.exports = {
    validatePost,
    validateComments,
    validateLikes
};
