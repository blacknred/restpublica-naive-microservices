function validateUser(req, res, next) {
    if (req.method === 'POST') {
        req.checkBody('username')
            .notEmpty()
            .withMessage('Name cannot be empty');
        req.checkBody('fullname')
            .notEmpty()
            .withMessage('Full name cannot be empty');
        req.checkBody('email')
            .isEmail()
            .withMessage('Must be an valid email');
        req.checkBody('password')
            .matches(/^.*(?=.{5,})(?=.*\d)(?=.*[a-zA-Z]).*$/)
            .withMessage(`Password must be at least 5 chars 
            long and contain at least one number`);
    } else if (req.method === 'PUT') {
        req.checkBody('username')
            .notEmpty()
            .withMessage('Name cannot be empty');
        req.checkBody('fullname')
            .notEmpty()
            .withMessage('Full name cannot be empty');
        req.checkBody('email')
            .isEmail()
            .withMessage('Must be an valid email');
    }
    const errors = req.validationErrors();
    if (errors) {
        return res.status(200)
            .json({ status: `Validation failed`, failures: errors });
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
            .matches(/^.*(?=.{5,})(?=.*\d)(?=.*[a-zA-Z]).*$/)
            .withMessage(`Password must be at least 5 chars 
            long and contain at least one number`);
    }
    const errors = req.validationErrors();
    if (errors) {
        return res.status(200)
            .json({ status: `Validation failed`, failures: errors });
    }
    return next();
}

function validateUsersNames(req, res, next) {
    if (req.method === 'POST') {
        req.checkBody('users')
            .isInt()
            .withMessage('Name cannot be integer');
    }
    const errors = req.validationErrors();
    if (errors) {
        return res.status(400)
            .json({ status: `Validation failed`, failures: errors });
    }
    return next();
}

function validateUserSubscriptions(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('id')
            .isInt()
            .withMessage('Must be integer');
    } else if (req.method === 'POST') {
        req.checkBody('id')
            .isInt()
            .withMessage('Must be integer');
    }
    const errors = req.validationErrors();
    if (errors) {
        return res.status(400)
            .json({ status: `Validation failed`, failures: errors });
    }
    return next();
}

module.exports = {
    validateUser,
    validateUserLogin,
    validateUsersNames,
    validateUserSubscriptions
};
