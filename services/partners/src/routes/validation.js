const queries = require('../db/queries');

function plans(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('name').notEmpty().withMessage('Name cannot be empty');
    } else if (req.method === 'POST') {
        req.checkBody('name').notEmpty().withMessage('Name cannot be empty');
        req.checkBody('limit')
            .isInt({ min: 50, max: 1000 }).withMessage('Limit must be integer within 50 - 1000');
        req.checkBody('price').isInt().withMessage(`Limit must be integer`);
        req.checkBody('name').custom((value) => {
            return queries.getPlan(value).then((plan) => {
                if (plan) throw new Error(`Name ${req.body.name} is already in use`);
            });
        });
    } else if (req.method === 'PUT') {
        req.checkParams('name').notEmpty().withMessage('Name cannot be empty');
        req.checkBody('option')
            .isIn(['name', 'limit', 'price']).withMessage('Update option is not valid');
        req.checkBody('value').notEmpty().withMessage('Update value cannot be empty');
    } else if (req.method === 'DELETE') {
        req.checkParams('name').notEmpty().withMessage('Name cannot be empty');
    }
    const failures = req.validationErrors();
    if (failures) return res.status(422).json({ status: `Validation failed`, failures });
    return next();
}

function apps(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('aid').isMongoId().withMessage('App id must be valid');
    } else if (req.method === 'POST') {
        if (req.path === '/check') {
            req.checkBody('apiKey').notEmpty().withMessage('API key cannot be empty');
            req.checkBody('domain')
                .matches(/[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/)
                .withMessage('Domain should be valid');
        } else {
            req.checkBody('planId').isInt().withMessage('API plan id must be integer');
            req.checkBody('domain')
                .matches(/[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/)
                .withMessage(`Domain should be valid`);
            req.checkBody('email').isEmail().withMessage(`Email must be valid`);
            req.checkBody('domain').custom((value) => {
                return queries.findAppByDomain(value).then((domain) => {
                    if (domain) throw new Error(`Domain ${req.body.domain} is already in use`);
                });
            });
        }
    } else if (req.method === 'PUT') {
        req.checkParams('aid').isMongoId().withMessage('App id must be empty');
        req.checkBody('option')
            .isIn(['planId', 'domain', 'email']).withMessage('Update option is not valid');
        req.checkBody('value').notEmpty().withMessage('Update value cannot be empty');
    } else if (req.method === 'DELETE') {
        req.checkParams('aid').isMongoId().withMessage('App id must be valid');
    }
    const failures = req.validationErrors();
    if (failures) return res.status(422).json({ status: `Validation failed`, failures });
    return next();
}

module.exports = {
    plans,
    apps
};
