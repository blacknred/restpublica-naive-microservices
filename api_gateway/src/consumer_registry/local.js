const jwt = require('jwt-simple');
const moment = require('moment');
const bcrypt = require('bcryptjs');

function encodeToken(userId = 0) {
    const playload = {
        exp: moment().add(5, 'seconds').unix(),
        iat: moment().unix(),
        sub: userId,
    };
    return jwt.encode(playload, process.env.TOKEN_SECRET);
}

function genApiSecret(apiKey) {
    // return hash based on apiKey and TOKEN_SECRET
    return bcrypt.hashSync(apiKey, process.env.TOKEN_SECRET);
}

module.exports = {
    encodeToken,
    genApiSecret
};
