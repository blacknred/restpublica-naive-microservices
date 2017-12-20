/* eslint-disable no-unused-vars */
const bcrypt = require('bcryptjs');
const util = require('util');
const faker = require('faker');
const fetch = require('node-fetch');
const knex = require('../db/connection');
const localAuth = require('./local');


const limit = 15;
const lettersAvatars = (fullname) => {
    const name = fullname.replace(' ', '+');
    const background = faker.internet.color().replace('#', '');
    return `https://ui-avatars.com/api/?name=${name}&size=128&background=${background}`;
};
const adorableAvatars = (fullname) => {
    return `https://api.adorable.io/avatars/285/${fullname}.png`;
};
const fakerAvatar = 'http://faker.hook.io/?property=image.avatar';

/* auth */

function createAvatar(fullname) {
    return fetch(lettersAvatars(fullname))
        .then((res) => {
            return res.buffer();
        })
        .then((buffer) => {
            return buffer;
        })
        .catch(() => {
            return null;
        });
}

function comparePass(userPassword, databasePassword) {
    return bcrypt.compareSync(userPassword, databasePassword);
}

function findUserByName(username) {
    return knex('users')
        .select(['id', 'password', 'avatar'])
        .where('username', username)
        .first();
}

function findUserByEmail(email) {
    return knex('users')
        .select('id')
        .where('email', email)
        .first();
}

/* eslint-disable consistent-return */
function ensureAuthenticated(req, res, next) {
    if (!req.headers.authorization) {
        if (req.params.username) {
            req.user = null;
            return next();
        }
        return res.status(400).json({
            status: 'Please log in'
        });
    }
    // decode the token
    const header = req.headers.authorization.split(' ');
    const token = header[1];
    localAuth.decodeToken(token, (err, payload) => {
        if (err) {
            return res.status(401).json({
                status: 'Token has expired'
            });
        }
        return knex('users')
            .where({ id: parseInt(payload.sub, 10) }).first()
            .then((user) => {
                req.user = user.id;
                return next();
            })
            .catch(() => {
                return res.status(500).json({
                    status: 'error'
                });
            });
    });
}
/* eslint-enable consistent-return */

function createUser(newUser) {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(newUser.password, salt);
    return createAvatar(newUser.name)
        .then((ava) => {
            return knex('users')
                .insert({
                    username: newUser.username,
                    fullname: newUser.fullname,
                    password: hash,
                    email: newUser.email,
                    avatar: ava
                })
                .returning(['id', 'username', 'avatar']);
        })
        .catch(() => {
            return null;
        });
}

function updateUser(userId, userObj) {
    return knex('users')
        .update(userObj)
        .where('id', userId)
        .returning(['username', 'fullname', 'email']);
}

function updateUserPic(userId, userPic) {
    return knex('users')
        .update('avatar', userPic)
        .where('id', userId)
        .returning('avatar');
}

function getProfileData(userId) {
    return knex('users')
        .select(['username', 'fullname', 'description', 'email', 'avatar'])
        .where('id', userId)
        .first();
}

function getUserData(userName, authUserId) {
    const result = {};
    return knex('users')
        .select(['id', 'username', 'fullname', 'description', 'avatar'])
        .where('username', userName)
        .first()
        .then((rows) => {
            if (!rows) throw new Error();
            result.data = rows;
            return knex('subscriptions')
                .count('* as followers_count')
                .where('user_id', result.data.id)
                .first();
        })
        .then((rows) => {
            result.data.followers_count = rows.followers_count;
            return knex('subscriptions')
                .count('* as followin_count')
                .where('sub_user_id', result.data.id)
                .first();
        })
        .then((rows) => {
            result.data.followin_count = rows.followin_count;
            return authUserId === null ? null :
                knex('subscriptions')
                    .select('id')
                    .where({ user_id: result.data.id, sub_user_id: authUserId })
                    .first();
        })
        .then((rows) => {
            if (authUserId !== null && rows !== undefined) {
                result.data.subscription_id = rows.id;
            } else {
                result.data.subscription_id = null;
            }
            return result.data;
        })
        .catch(() => {
            return null;
        });
}

function getUsersConciseData(usersIdsArr) {
    return knex('users')
        .select(['id as user_id', 'username', 'avatar'])
        .whereIn('id', usersIdsArr)
        .then((rows) => {
            return rows;
        })
        .catch(() => {
            return null;
        });
}

/* subscriptions */

function getFollowers(userId, offset, authUserId) {
    return knex('subscriptions')
        .select(['subscriptions.id as subscription_id', 'sub_user_id as user_id',
            'username', 'fullname', 'avatar'])
        .rightJoin('users', 'users.id', 'subscriptions.sub_user_id')
        .where('user_id', userId)
        .andWhere('sub_user_id', '!=', authUserId)
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            const r = _row;
            return knex('subscriptions')
                .select('id')
                .where({ user_id: _row.user_id, sub_user_id: authUserId })
                .first()
                .then((row) => {
                    r.my_subscription_id = row ? row.id : null;
                    return r;
                });
        })
        .then((rows) => {
            return knex('subscriptions')
                .count('*')
                .where('user_id', userId)
                .andWhere('sub_user_id', '!=', authUserId)
                .first()
                .then((count) => {
                    return Object.assign({}, { count: count.count }, { subscriptions: rows });
                });
        })
        .catch(() => {
            return null;
        });
}

function getFollowin(userId, offset, authUserId) {
    return knex('subscriptions')
        .select(['subscriptions.id as subscription_id', 'user_id',
            'username', 'fullname', 'avatar'])
        .rightJoin('users', 'users.id', 'subscriptions.user_id')
        .where('sub_user_id', userId)
        .andWhere('user_id', '!=', authUserId)
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            const r = _row;
            return knex('subscriptions')
                .select('id')
                .where({ user_id: _row.user_id, sub_user_id: authUserId })
                .first()
                .then((row) => {
                    r.my_subscription_id = row ? row.id : null;
                    return r;
                });
        })
        .then((rows) => {
            return knex('subscriptions')
                .count('*')
                .where('sub_user_id', userId)
                .andWhere('user_id', '!=', authUserId)
                .first()
                .then((count) => {
                    return Object.assign({}, { count: count.count }, { subscriptions: rows });
                });
        })
        .catch(() => {
            return null;
        });
}

function getConciseFollowin(userId) {
    return knex('subscriptions')
        .select('user_id')
        .where('sub_user_id', userId)
        // ? limit
        .then((rows) => {
            return rows;
        })
        .catch(() => {
            return null;
        });
}

function createSubscription(userId, subUserId) {
    // upsert
    const data = {
        user_id: userId,
        sub_user_id: subUserId
    };
    const insert = knex('subscriptions').insert(data);
    const update = knex('subscriptions').update(data);
    const query = util.format(
        '%s ON CONFLICT (user_id, sub_user_id) DO UPDATE SET %s RETURNING id',
        insert.toString(),
        update.toString().replace(/^update\s.*\sset\s/i, '')
    );
    return knex.raw(query)
        .then((rows) => {
            return rows.rows[0].id;
        })
        .catch(() => {
            return null;
        });
}

function deleteSubscription(id) {
    return knex('subscriptions').del()
        .where('id', id)
        .returning('id');
}

module.exports = {
    createAvatar,
    comparePass,
    findUserByName,
    findUserByEmail,
    ensureAuthenticated,
    createUser,
    updateUser,
    updateUserPic,
    getProfileData,
    getUserData,
    getUsersConciseData,
    getFollowers,
    getFollowin,
    getConciseFollowin,
    createSubscription,
    deleteSubscription
};
