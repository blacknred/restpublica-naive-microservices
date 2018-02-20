const jwt = require('jwt-simple');
const moment = require('moment');
const bcrypt = require('bcryptjs');

const encodeToken = (userId) => {
    const playload = {
        exp: moment().add(5, 'secounds').unix(),
        iat: moment().unix(),
        sub: userId,
    };
    return jwt.encode(playload, process.env.TOKEN_SECRET);
};

function genApiSecret(apiKey) {
    // return hash based on apiKey and TOKEN_SECRET
    return bcrypt.hashSync(apiKey, process.env.TOKEN_SECRET);
}

module.exports.encodeToken = {
    encodeToken,
    genApiSecret
};
