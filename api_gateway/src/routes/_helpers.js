/* esmlint-disable */
const request = require('request-promise');


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
    // ensureAuthenticated,

    // getUserPostsCount,
    // getUsersPosts
};
