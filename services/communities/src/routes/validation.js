function validateUser(req, res, next) {
    if (req.method === 'POST') {
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
    const failures = req.validationErrors();
    if (failures) {
        return res.status(422)
            .json({ status: `Validation failed`, failures });
    }
    return next();
}

function validateUsersArr(req, res, next) {
    const usersIdArr = req.params.userids.split(',');
    let failures = null;
    usersIdArr.forEach((id) => {
        if (!Number.isInteger(parseInt(id, 10))) {
            failures++;
        }
    });
    if (failures) {
        return res.status(422)
            .json({ status: `Validation failed`, failures: 'Users id must be integer' });
    }
    return next();
}

function validateSearch(req, res, next) {
    req.checkParams('query')
        .matches(/^.{3,}$/)
        .withMessage('Search query must has at least 3 chars');
    const failures = req.validationErrors();
    if (failures) {
        return res.status(422)
            .json({ status: `Validation failed`, failures });
    }
    return next();
}

function validateUserLogin(req, res, next) {
    req.checkBody('username')
        .notEmpty()
        .withMessage('Name cannot be empty');
    req.checkBody('password')
        .matches(/^.*(?=.{5,})(?=.*\d)(?=.*[a-zA-Z]).*$/)
        .withMessage(`Password must be at least 5 chars 
        long and contain at least one number`);
    const failures = req.validationErrors();
    if (failures) {
        return res.status(422)
            .json({ status: `Validation failed`, failures });
    }
    return next();
}

function validateUserAvatar(req, res, next) {
    if (!req.files.avatar) {
        return res.status(422)
            .json({ status: `Validation failed`, failures: 'No image was uploaded' });
    }
    return next();
}


function validateUserSubscriptions(req, res, next) {
    const pattern = new RegExp(`^((?!${req.user})[0-9]*)$`);
    if (req.method === 'GET') {
        req.checkParams('userid')
            .isInt()
            .withMessage('Must be integer');
    } else if (req.method === 'POST') {
        req.checkBody('userId')
            .isInt()
            .withMessage('Must be integer')
            .matches(pattern)
            .withMessage('Trying subscribe self');
    }
    const failures = req.validationErrors();
    if (failures) {
        return res.status(422)
            .json({ status: `Validation failed`, failures });
    }
    return next();
}

module.exports = {
    validateUser,
    validateUsersArr,
    validateSearch,
    validateUserLogin,
    validateUserAvatar,
    validateUserSubscriptions
};
