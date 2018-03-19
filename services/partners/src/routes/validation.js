/* eslint-disable no-throw-literal */

const queries = require('../db/queries');

function plans(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('name').notEmpty().withMessage('Name cannot be empty');
    } else if (req.method === 'POST') {
        req.checkBody('name').notEmpty().withMessage('Name cannot be empty');
        req.checkBody('limit')
            .isInt({ min: 50, max: 1000 }).withMessage('Limit must be integer within 50 - 1000');
        req.checkBody('price').isInt().withMessage(`Price must be integer`);
        if (req.body.name) {
            req.checkBody('name').custom((value) => {
                return queries.getPlan(value).then(plan => plan || false);
            }).withMessage('Name is already in use');
        }
    } else if (req.method === 'PUT') {
        req.checkParams('name').notEmpty().withMessage('Name cannot be empty');
        req.checkBody('option')
            .isIn(['name', 'limit', 'price']).withMessage('Update option is not valid');
        req.checkBody('value').notEmpty().withMessage('Update value cannot be empty');
        if (req.body.option && req.body.value) {
            switch (req.body.option) {
                case 'name':
                    req.checkBody('value').custom((value) => {
                        return queries.getPlan(value).then(plan => plan || false);
                    }).withMessage('Name is already in use');
                    break;
                case 'limit':
                    req.checkBody('value').isInt({ min: 50, max: 1000 })
                        .withMessage('Limit must be integer within 50 - 1000');
                    break;
                case 'price':
                    req.checkBody('value').isInt().withMessage(`Price must be integer`);
                    break;
                default:
            }
        }
    } else if (req.method === 'DELETE') {
        req.checkParams('name').notEmpty().withMessage('Name cannot be empty');
    }
    const failures = req.validationErrors();
    if (failures) throw { status: 422, message: failures };
    return next();
}

function apps(req, res, next) {
    const pattern = /[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/;
    if (req.method === 'GET') {
        req.checkParams('aid').isMongoId().withMessage('App id must be valid');
    } else if (req.method === 'POST') {
        if (req.path === '/check') {
            req.checkBody('apiKey').notEmpty().withMessage('API key cannot be empty');
            req.checkBody('domain')
                .matches(pattern)
                .withMessage('Domain is empty or not valid');
        } else {
            req.checkBody('planId').isInt().withMessage('API plan id must be integer');
            req.checkBody('domain')
                .matches(pattern)
                .withMessage('Domain is empty or not valid');
            req.checkBody('email').isEmail().withMessage(`Email must be valid`);
            if (req.body.domain && req.body.domain.test(pattern)) {
                req.checkBody('domain').custom((value) => {
                    return queries.findAppByDomain(value).then(domain => domain || false);
                }).withMessage('Domain is already in use');
            }
        }
    } else if (req.method === 'PUT') {
        req.checkParams('aid').isMongoId().withMessage('App id must be empty');
        req.checkBody('option')
            .isIn(['planId', 'domain', 'email']).withMessage('Update option is not valid');
        req.checkBody('value').notEmpty().withMessage('Update value cannot be empty');
        if (req.body.option && req.body.value) {
            switch (req.body.option) {
                case 'planId':
                    req.checkBody('value').isInt().withMessage('API plan id  must be integer');
                    break;
                case 'email':
                    req.checkBody('value').isEmail().withMessage('Email value must be valid');
                    break;
                case 'domain':
                    req.checkBody('value').custom((value) => {
                        return queries.findAppByDomain(value).then(domain => domain || false);
                    }).withMessage('Domain is already in use');
                    break;
                default:
            }
        }
    } else if (req.method === 'DELETE') {
        req.checkParams('aid').isMongoId().withMessage('App id must be valid');
    }
    const failures = req.validationErrors();
    if (failures) throw { status: 422, message: failures };
    return next();
}

module.exports = {
    plans,
    apps
};
