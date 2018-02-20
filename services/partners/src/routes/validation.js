function check(req, res, next) {
    req.checkBody('apiKey')
        .notEmpty()
        .withMessage('apiKey cannot be empty');
    req.checkBody('domain')
        .matches(/[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/)
        .withMessage(`Domain should be valid`);
    const failures = req.validationErrors();
    if (failures) {
        return res.status(422)
            .json({ status: `Validation failed`, failures });
    }
    return next();
}

function plan(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('pid')
            .isInt()
            .withMessage('API plan id must be integer');
    } else if (req.method === 'POST') {
        req.checkBody('name')
            .notEmpty()
            .withMessage('Name cannot be empty');
        req.checkBody('limit')
            .isInt()
            .withMessage(`Limit must be integer`);
        req.checkBody('price')
            .isInt()
            .withMessage(`Limit must be integer`);
    } else if (req.method === 'PUT') {
        req.checkParams('pid')
            .isInt()
            .withMessage('API plan id must be integer');
        req.checkBody('option')
            .notEmpty()
            .withMessage('Update option cannot be empty');
        req.checkBody('value')
            .notEmpty()
            .withMessage('Update value cannot be empty');
    } else if (req.method === 'DELETE') {
        req.checkParams('pid')
            .isInt()
            .withMessage('API plan id must be integer');
    }
    const failures = req.validationErrors();
    if (failures) {
        return res.status(422)
            .json({ status: `Validation failed`, failures });
    }
    return next();
}

function app(req, res, next) {
    if (req.method === 'GET') {
        req.checkParams('aid')
            .isInt()
            .withMessage('App id must be integer');
    } else if (req.method === 'POST') {
        req.checkBody('planId')
            .isInt()
            .withMessage('API plan id should be integer');
        req.checkBody('adminId')
            .isInt()
            .withMessage(`App admin id should be integer`);
        req.checkBody('domain')
            .matches(/[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/)
            .withMessage(`Domain should be valid`);
        req.checkBody('email')
            .matches(/^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9\\-\\.]+)\\.([a-zA-Z]{2,5})$/)
            .withMessage(`Email should be valid`);
    } else if (req.method === 'PUT') {
        req.checkParams('aid')
            .isInt()
            .withMessage('App id must be integer');
        req.checkBody('option')
            .notEmpty()
            .withMessage('Update option cannot be empty');
        req.checkBody('value')
            .notEmpty()
            .withMessage('Update value cannot be empty');
    } else if (req.method === 'DELETE') {
        req.checkParams('aid')
            .isInt()
            .withMessage('pp id must be integer');
    }
    const failures = req.validationErrors();
    if (failures) {
        return res.status(422)
            .json({ status: `Validation failed`, failures });
    }
    return next();
}

module.exports = {
    check,
    plan,
    app
};
