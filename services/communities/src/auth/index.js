/* eslint-disable consistent-return */

const decodeToken = require('./local');

function authentication(req, res, next) {
    if (process.env.NODE_ENV === 'test') {
        req.user = 1;
        return next();
    }
    const token = req.headers['x-access-token'] || req.query.access_token || null;
    if (!token) {
        return res.status(401).json({ status: 'No access token' });
    }
    // decode the token
    decodeToken(token, (err, payload) => {
        if (err) {
            return res.status(401).json({
                status: 'error',
                message: payload
            });
        }
        req.user = parseInt(payload.sub, 10);
        return next();
    });
}

function ensureAuthenticated(req, res, next) {
    if (req.user === 0) {
        return res.status(403).json({ status: 'Permission denied' });
    }
    return next();
}
module.exports = {
    authentication,
    ensureAuthenticated
};

