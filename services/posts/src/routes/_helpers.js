const request = require('request-promise');
const fs = require('fs');

function ensureAuthenticated(req, res, next) {
    /* eslint-disable */
    if (process.env.NODE_ENV === 'test') {
        ensureAuthenticated = (req, res, next) => {
            req.user = 1;
            return next();
        };
    }
    /* eslint-enable */
    if (!(req.headers && req.headers.authorization)) {
        return res.status(400).json({ status: 'Please log in' });
    }
    const options = {
        method: 'GET',
        uri: 'http://users-service:3001/api/v1/users/current',
        json: true,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}`,
        },
    };
    return request(options)
        .then((response) => {
            req.user = response.user[0].id;
            return next();
        })
        .catch((err) => {
            return next(err);
        });
}

function getSubscriptions(req, next) {
    const options = {
        method: 'GET',
        uri: 'http://users-service:3001/api/v1/users/subscriptions',
        json: true,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}`,
        },
    };
    return request(options)
        .then((response) => {
            return response.subscriptions.map((sub) => {
                return sub.sub_user_id;
            });
        })
        .catch((err) => {
            return next(err);
        });
}

function getUsersConciseData(usersIdsArr, req, next) {
    const options = {
        method: 'GET',
        uri: `http://users-service:3001/api/v1/users/concise?ids=${usersIdsArr}`,
        json: true,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}`,
        }
    };
    return request(options)
        .then((response) => {
            return response.users;
        })
        .catch((err) => {
            return next(err);
        });
}

function removePostFiles(paths) {
    const [filePath, thumbPath] = paths;
    return fs.unlinkSync(filePath)
        .then(() => {
            if (thumbPath) fs.unlinkSync(thumbPath);
        })
        .then(() => {
            return true;
        })
        .catch((err) => {
            console.log(err);
            return false;
        });
}

module.exports = {
    ensureAuthenticated,
    getSubscriptions,
    getUsersConciseData,
    removePostFiles
};
