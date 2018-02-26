function user(req, res, next) {
    if (req.method === 'POST') {
        if (req.path === '/login') {
            req.checkBody('username')
                .notEmpty()
                .withMessage('Name cannot be empty');
            req.checkBody('password')
                .matches(/^.*(?=.{5,})(?=.*\d)(?=.*[a-zA-Z]).*$/)
                .withMessage(`Password must be at least 5 chars 
        long and contain at least one number`);
        } else {
            req.checkBody('username')
                .notEmpty()
                .withMessage('Name cannot be empty');
            req.checkBody('password')
                .matches(/^.*(?=.{5,})(?=.*\d)(?=.*[a-zA-Z]).*$/)
                .withMessage(`Password must be at least 5 chars 
            long and contain at least one number`);
            req.checkBody('fullname')
                .notEmpty()
                .withMessage('Full name cannot be empty');
            req.checkBody('email')
                .isEmail()
                .withMessage('Must be an valid email');
        }
    } else if (req.method === 'PUT') {
        if (!req.files) {
            req.checkBody('option')
                .notEmpty()
                .withMessage('Update option cannot be empty');
            req.checkBody('value')
                .notEmpty()
                .withMessage('Update value cannot be empty');
        } else if (!req.files.avatar) {
            return res.status(422)
                .json({ status: `Validation failed`, failures: 'No image was uploaded' });
        }
    }
    const failures = req.validationErrors();
    if (failures) {
        return res.status(422)
            .json({ status: `Validation failed`, failures });
    }
    return next();
}

function profiles(req, res, next) {
    if (req.query.query) {
        req.checkQuery('query')
            .matches(/^.{3,}$/)
            .withMessage('Search query must has at least 3 chars');
    }
    if (req.query.users) {
        req.checkQuery('users')
            .matches(/[0-9]+/g)
            .withMessage('Users ids must be integers');
    }
    const failures = req.validationErrors();
    if (failures) {
        return res.status(422)
            .json({ status: `Validation failed`, failures });
    }
    return next();
}

function subscriptions(req, res, next) {
    const pattern = new RegExp(`^((?!${req.user})[0-9]*)$`);
    if (req.method === 'GET') {
        req.checkParams('uid')
            .isInt()
            .withMessage('Profile id must be integer');
    } else if (req.method === 'POST') {
        req.checkBody('id')
            .isInt()
            .withMessage('User id must be integer')
            .matches(pattern)
            .withMessage('Attempt to subscribe to yourself');
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
    user,
    profiles,
    subscriptions
};
