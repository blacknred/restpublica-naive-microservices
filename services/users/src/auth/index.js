/* eslint-disable */
const { decodeToken } = require('./local');

module.exports = function ensureAuthenticated(req, res, next) {
    if (process.env.NODE_ENV === 'test') {
        req.user = 1;
        return next();
    }
    if (!req.headers['x-auth-token']) {
        return res.status(401).json({ status: 'No access token' });
    }
    // decode the token
    const token = req.headers['x-auth-token'];
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
};

