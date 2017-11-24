const bcrypt = require('bcryptjs');
const util = require('util');
const fetch = require('node-fetch');
const knex = require('../db/connection');
const localAuth = require('./local');

/* auth */

function createAvatar(name) {
    return fetch(`https://api.adorable.io/avatars/285/${name}.png`)
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

function findUserByName(name) {
    return knex('users')
        .select(['id', 'password'])
        .where('name', name)
        .first();
}

function findUserByEmail(email) {
    return knex('users')
        .select('id')
        .where('email', email)
        .first();
}

function dbValidation(req, res, next) {
    let message = null;
    findUserByName(req.body.username)
        .then((user) => {
            if (user != null) message = `This name ${req.body.username} is already in use`;
            return findUserByEmail(req.body.email);
        })
        .then((user) => {
            if (user != null && message == null) message = `This email ${req.body.email} is already in use`;
            return message != null ? res.status(500).json({
                status: 'error',
                message
            }) : next();
        });
}

/* eslint-disable consistent-return */
function ensureAuthenticated(req, res, next) {
    if (!(req.headers && req.headers.authorization)) {
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
        return knex('users').where({ id: parseInt(payload.sub, 10) }).first()
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
        .then((avatar) => {
            return knex('users')
                .insert({
                    name: newUser.name,
                    fullname: newUser.fullname,
                    password: hash,
                    email: newUser.email,
                    avatar
                })
                .returning('*');
        });
}

function updateUser(userId, userObj) {
    return knex('users')
        .update(userObj)
        .where('id', userId)
        .returning('*');
}

function getUser(userId) {
    return knex('users')
        .select(['id', 'name', 'fullname', 'email', 'avatar'])
        .where('id', userId);
}

function getUserByName(userName) {
    return knex('users')
        .select(['id', 'name', 'fullname', 'avatar'])
        .where('name', userName);
}

function getConciseUsers(usersIdsArr) {
    return knex('users')
        .select(['id as user_id', 'name', 'avatar'])
        .whereIn('id', usersIdsArr);
}

/* subscriptions */

function getSubscriptions(userId) {
    return knex('subscriptions')
        .select(['sub_user_id', 'name', 'avatar'])
        .from('subscriptions')
        .rightJoin('users', 'users.id', 'subscriptions.sub_user_id')
        .where('user_id', userId);
}

function checkSubscription(userId, subUserId) {
    return knex('subscriptions')
        .where({
            user_id: userId,
            sub_user_id: subUserId
        })
        .first()
        .then((match) => {
            return match ? 'true' : 'false';
        })
        .catch(() => {
            return 'false';
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
        '%s ON CONFLICT (user_id, sub_user_id) DO UPDATE SET %s',
        insert.toString(),
        update.toString().replace(/^update\s.*\sset\s/i, '')
    );
    return knex.raw(query);
}

function deleteSubscription(userId, subUserId) {
    return knex('subscriptions').del()
        .where({
            user_id: userId,
            sub_user_id: subUserId
        });
}

module.exports = {
    createAvatar,
    comparePass,
    findUserByName,
    findUserByEmail,
    dbValidation,
    ensureAuthenticated,
    createUser,
    updateUser,
    getUser,
    getUserByName,
    getConciseUsers,
    getSubscriptions,
    checkSubscription,
    createSubscription,
    deleteSubscription
};
