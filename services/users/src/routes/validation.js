/* eslint-disable no-throw-literal */

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
            req.checkBody('password')
                .matches(/^.*(?=.{5,})(?=.*\d)(?=.*[a-zA-Z]).*$/)
                .withMessage('Password must has at least 5 chars and one number');
        } else {
            req.checkBody('username').notEmpty().withMessage('Username cannot be empty');
            req.checkBody('password')
                .matches(/^.*(?=.{5,})(?=.*\d)(?=.*[a-zA-Z]).*$/)
                .withMessage('Password must has at least 5 chars and one number');
            req.checkBody('fullname').notEmpty().withMessage('Fullname cannot be empty');
            req.checkBody('email').isEmail().withMessage('Email must be valid ');
        }
    } else if (req.method === 'PUT') {
        req.checkBody('option')
            .isIn(['username', 'email', 'fullname', 'description', 'active', 'avatar'])
            .withMessage('Option is not valid');
        req.checkBody('value').notEmpty().withMessage('Update value cannot be empty');
        if (req.body.option && req.body.value) {
            switch (req.body.option) {
                case 'email':
                    req.checkBody('value').isEmail().withMessage('Email value must be valid');
                    break;
                case 'avatar':
                    req.checkBody('value').custom(value => value.replace(/\n/g, '')
                        .match(/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/))
                    .withMessage('Avatar value must be base64');
                    break;
                default:
            }
        }
    }
    const failures = req.validationErrors();
    if (failures) throw { status: 422, message: failures };
    return next();
}

function subscriptions(req, res, next) {
    req.checkParams('uid').isInt().withMessage('Profile id must be integer');
    if (req.method === 'GET') {
        if (req.query.lim) {
            req.checkQuery('lim').isIn(['id']).withMessage('Limiter must be valid');
        }
    } else if (req.method === 'POST') {
        req.checkParams('uid').not().isIn([req.user]).withMessage('Subscribe to yourself');
    } else if (req.method === 'DELETE') {
        req.checkParams('sid').isInt().withMessage('Subscription id must be integer');
    }
    const failures = req.validationErrors();
    if (failures) throw { status: 422, message: failures };
    return next();
}


module.exports = {
    users,
    subscriptions
};
