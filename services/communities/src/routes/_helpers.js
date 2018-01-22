/* eslint-disable */
const request = require('request-promise');
const auth = require('./_auth');

function ensureAuthenticated(req, res, next) {
    if (process.env.NODE_ENV === 'test') {
        ensureAuthenticated = (req, res, next) => {
            req.user = 1;
            return next();
        };
    }
    if (!(req.headers && req.headers.authorization)) {
        return res.status(400)
            .json({
                status: 'error',
                message: 'No access token.'
            });
    }
    // decode the token
    const header = req.headers.authorization.split(' ');
    const token = header[1];
    auth.decodeToken(token, (err, payload) => {
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

// function getUserPostsCount(userId) {
//     const options = {
//         method: 'GET',
//         uri: `http://posts-service:3002/api/v1/posts/getcount/${userId}`,
//         json: true,
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     };
//     return request(options)
//         .then((data) => {
//             return data.data;
//         })
//         .catch(() => {
//             return null;
//         });
// }

// function getUsersPosts(usersIdArr) {
//     const options = {
//         method: 'GET',
//         uri: `http://posts-service:3002/api/v1/posts/users/${usersIdArr}`,
//         json: true,
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     };
//     return request(options)
//         .then((data) => {
//             return data.data;
//         })
//         .catch(() => {
//             return null;
//         });
// }

module.exports = {
    ensureAuthenticated,
    // getUserPostsCount,
    // getUsersPosts
};
