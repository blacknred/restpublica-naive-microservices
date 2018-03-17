const queries = require('../db/queries.js');

function users(req, res, next) {
    if (req.method === 'GET') {
        if (req.query.query) {
            req.checkQuery('query')
                .isLength({ min: 3 }).withMessage('Search query must have at least 3 chars');
        }
        if (req.query.list) {
            req.checkQuery('list').matches(/^[0-9,]+$/g).withMessage('Users ids must be integers');
        }
        if (req.query.lim) {
            req.checkQuery('lim').isIn(['id', 'avatar']).withMessage('Limiter must be valid');
        }
    } else if (req.method === 'POST') {
        if (req.path === '/login') {
            req.checkBody('username').notEmpty().withMessage('Name cannot be empty');
            if (req.body.username) {
                req.checkBody('username').custom((value) => {
                    return queries.findProfileByName(value).then(name => name || false);
                }).withMessage('Name is already in use');
            }
            req.checkBody('password')
                .matches(/^.*(?=.{5,})(?=.*\d)(?=.*[a-zA-Z]).*$/)
                .withMessage('Password must has at least 5 chars and one number');
            if (req.body.password &&
                req.body.password.test(/^.*(?=.{5,})(?=.*\d)(?=.*[a-zA-Z]).*$/)) {
                req.checkBody('password').custom((value) => {
                    return queries.findProfileByName(value)
                        .then(user => queries.comparePass(value, user.password))
                        .then(status => status || false);
                }).withMessage('Incorrect password');
            }
        } else {
            req.checkBody('username').notEmpty().withMessage('Username cannot be empty');
            if (req.body.username) {
                req.checkBody('username').custom((value) => {
                    return queries.findProfileByName(value).then(name => name || false);
                }).withMessage('Name is already in use');
            }
            req.checkBody('password')
                .matches(/^.*(?=.{5,})(?=.*\d)(?=.*[a-zA-Z]).*$/)
                .withMessage('Password must has at least 5 chars and one number');
            req.checkBody('fullname').notEmpty().withMessage('Fullname cannot be empty');
            req.checkBody('email').isEmail().withMessage('Must be an valid email');
            if (req.body.email &&
                req.body.email.test(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
                req.checkBody('email').custom((value) => {
                    return queries.findProfileByEmail(value).then(email => email || false);
                }).withMessage(`Email is already in use`);
            }
        }
    } else if (req.method === 'PUT') {
        req.checkBody('option')
            .isIn(['username', 'email', 'fullname', 'description', 'active', 'avatar'])
            .withMessage('Option is not valid');
        req.checkBody('value').notEmpty().withMessage('Update value cannot be empty');
        if (req.body.option && req.body.value) {
            switch (req.body.option) {
                case 'username':
                    req.checkBody('value').custom((value) => {
                        return queries.findProfileByName(value).then(name => name || false);
                    }).withMessage('Username value is already in use');
                    break;
                case 'email':
                    req.checkBody('value').isEmail().withMessage('Email value must be valid');
                    break;
                case 'avatar':
                    req.checkBody('value').custom((value) => {
                        return Buffer.from(value, 'base64').toString('base64') === value;
                    }).withMessage('Avatar value must be base64');
                    break;
                case 'active':
                    req.checkBody('value').custom(() => {
                        return queries.checkAdmin(req.user).then(admin => admin || false);
                    }).withMessage('Attempt to inactive admin');
                    break;
                default:
            }
        }
    }
    const failures = req.validationErrors();
    if (failures) return res.status(422).json({ status: `Validation failed`, failures });
    return next();
}

function subscriptions(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('uid').isInt().withMessage('Profile id must be integer');
        if (req.query.lim) {
            req.checkQuery('lim').isIn(['id']).withMessage('Limiter must be valid');
        }
    } else if (req.method === 'POST') {
        req.checkBody('id').isInt().withMessage('User id must be integer');
        req.checkBody('id').not().isIn([req.user]).withMessage('Subscribe to yourself');
    } else if (req.method === 'DELETE') {
        req.checkParams('sid').isInt().withMessage('Subscription id must be integer');
    }
    const failures = req.validationErrors();
    if (failures) return res.status(422).json({ status: `Validation failed`, failures });
    return next();
}


module.exports = {
    users,
    subscriptions
};
