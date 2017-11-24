function validateUser(req, res, next) {
    if (req.method === 'POST') {
        req.checkBody('username')
            .notEmpty()
            .withMessage('Name cannot be empty');
        req.checkBody('fullname')
            .notEmpty()
            .withMessage('Full name cannot be empty');
        req.checkBody('email')
            .notEmpty()
            .withMessage('Full name cannot be empty')
            .isEmail()
            .withMessage('Must be an valid email');
        req.checkBody('password')
            .isLength({ min: 5 })
            .matches(/\d/)
            .withMessage('passwords must be at least 5 chars long and contain one number');
    } else if (req.method === 'PUT') {
        req.checkBody('name')
            .notEmpty()
            .withMessage('Name cannot be empty');
        req.checkBody('fullname')
            .notEmpty()
            .withMessage('Full name cannot be empty');
        req.checkBody('email')
            .notEmpty()
            .withMessage('Full name cannot be empty')
            .isEmail()
            .withMessage('Must be an valid email');
        req.checkBody('avatar')
            .notEmpty()
            .withMessage('Full name cannot be empty');
    }
    const errors = req.validationErrors();
    if (errors) {
        return res.status(400)
            .json({ message: `Validation failed`, failures: errors });
    }
    return next();
}

function validateUserLogin(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('username')
            .notEmpty()
            .withMessage('Name cannot be empty');
    } else if (req.method === 'POST') {
        req.checkBody('username')
            .notEmpty()
            .withMessage('Name cannot be empty');
        req.checkBody('password')
            .isLength({ min: 5 })
            .matches(/\d/)
            .withMessage('passwords must be at least 5 chars long and contain one number');
    }
    const errors = req.validationErrors();
    if (errors) {
        return res.status(400)
            .json({ message: `Validation failed`, failures: errors });
    }
    return next();
}

function validateUsersNames(req, res, next) {
    if (req.method === 'POST') {
        req.checkBody('users')
            .notEmpty()
            .isInt()
            .withMessage('Name cannot be empty');
    }
    const errors = req.validationErrors();
    if (errors) {
        return res.status(400)
            .json({ message: `Validation failed`, failures: errors });
    }
    return next();
}

function validateUserSubscriptions(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('id')
            .notEmpty()
            .isInt()
            .withMessage('Must be valid');
    } else if (req.method === 'POST') {
        req.checkBody('id')
            .notEmpty()
            .isInt()
            .withMessage('Must be valid');
    }
    const errors = req.validationErrors();
    if (errors) {
        return res.status(400)
            .json({ message: `Validation failed`, failures: errors });
    }
    return next();
}

module.exports = {
    validateUser,
    validateUserLogin,
    validateUsersNames,
    validateUserSubscriptions
};
