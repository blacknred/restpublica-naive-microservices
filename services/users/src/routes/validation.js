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
            req.checkBody('password')
                .matches(/^.*(?=.{5,})(?=.*\d)(?=.*[a-zA-Z]).*$/)
                .withMessage('Password must has at least 5 chars and one number');
            req.checkBody('username').custom((value) => {
                return queries.findProfileByName(value)
                    .then((user) => {
                        if (!user) throw new Error(`Name ${value} is not in use`);
                        return queries.comparePass(req.body.password, user.password);
                    })
                    .then((status) => {
                        if (!status) throw new Error('Incorrect password');
                    });
            });
        } else {
            req.checkBody('username').notEmpty().withMessage('Username cannot be empty');
            req.checkBody('username').custom((value) => {
                return queries.findProfileByName(value)
                    .then((name) => {
                        if (name) throw new Error(`Name ${value} is already in use`);
                    });
            });
            req.checkBody('password')
                .matches(/^.*(?=.{5,})(?=.*\d)(?=.*[a-zA-Z]).*$/)
                .withMessage('Password must has at least 5 chars and one number');
            req.checkBody('fullname').notEmpty().withMessage('Fullname cannot be empty');
            req.checkBody('email').isEmail().withMessage('Must be an valid email');
            req.checkBody('email').custom((value) => {
                return queries.findProfileByEmail(value)
                    .then((name) => {
                        if (name) throw new Error(`Email ${value} is already in use`);
                    });
            });
        }
    } else if (req.method === 'PUT') {
        req.checkBody('option')
            .isIn(['username', 'email', 'fullname', 'description', 'active', 'avatar'])
            .withMessage('Option is not valid');
        req.checkBody('value').notEmpty().withMessage('Update value cannot be empty');
        if (req.body.option === 'active') {
            req.checkBody('option').custom(() => {
                return queries.checkAdmin(req.user)
                    .then((admin) => {
                        if (admin) throw new Error('Attempt to inactive admin');
                    });
            });
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
