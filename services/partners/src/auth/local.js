const jwt = require('jwt-simple');
const moment = require('moment');

module.exports = function decodeToken(token, callback) {
    const payload = jwt.decode(token, process.env.TOKEN_SECRET);
    const now = moment().unix();
    if (now > payload.exp) callback('Token has expired.');
    else callback(null, payload);
};

