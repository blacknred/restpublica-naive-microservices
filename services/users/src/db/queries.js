/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
const util = require('util');
const bcrypt = require('bcryptjs');
const knex = require('../db/connection');
const localAuth = require('../auth/local');

const limit = 12;
const today = new Date();
const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 20);


/* auth */

function checkUser(userId) {
    return knex('users')
        .where({ id: userId })
        .first()
        .then(user => user.id);
}

function comparePass(userPassword, databasePassword) {
    return bcrypt.compareSync(userPassword, databasePassword);
}

/* user */

function findProfileByName(username) {
    return knex('users')
        .select(['id', 'password', 'avatar'])
        .where({ username })
        .first();
}

function findProfileByEmail(email) {
    return knex('users')
        .select('id')
        .where({ email })
        .first();
}

function createUser(newUser) {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(newUser.password, salt);
    newUser.password = hash;
    return knex('users')
        .insert(newUser)
        .returning(['id', 'username', 'avatar']);
}

function updateUser(userObj, userId) {
    return knex('users')
        .update(userObj)
        .where('id', userId)
        .returning(`${Object.keys(userObj)[0]}`);
}

function getUserData(userId) {
    return knex('users')
        .select(['username', 'fullname', 'description', 'email', 'avatar'])
        .where('id', userId)
        .first();
}

function deleteUser(userId) {
    knex.transaction((trx) => {
        knex('users')
            .del()
            .where('id', userId)
            .transacting(trx)
            .then((data) => {
                return knex('users_subscriptions')
                    .del()
                    .where('sub_user_id', userId)
                    .andWhere('user_id', userId)
                    .transacting(trx);
            })
            .then(trx.commit)
            .catch(trx.rollback);
    })
        .then(data => data);
}


/* profile */

function getMySubscription(user, authUserId) {
    return knex('users_subscriptions')
        .select('id')
        .where({ user_id: user.id, sub_user_id: authUserId })
        .first()
        .then((row) => {
            user.my_subscription_id = row ? row.id : null;
            return user;
        });
}

function getProfileFollowersCount(user) {
    return knex('users_subscriptions')
        .count('*')
        .where('user_id', user.id)
        .first()
        .then((row) => {
            user.followers_count = row.count;
            return user;
        });
}

function getProfileFollowingCount(user) {
    return knex('users_subscriptions')
        .count('*')
        .where('sub_user_id', user.id)
        .first()
        .then((row) => {
            user.following_count = row.count;
            return user;
        });
}

function getProfileData(username, authUserId) {
    return knex('users')
        .select(['id', 'username', 'fullname', 'description', 'avatar'])
        .where({ username })
        .first()
        .then(_row => getProfileFollowersCount(_row))
        .then(_row => getProfileFollowingCount(_row))
        .then(_row => getMySubscription(_row, authUserId));
}

/* profiles */

function getProfilesData(usersIdArr) {
    return knex('users')
        .select(['id', 'username', 'avatar'])
        .whereIn('id', usersIdArr);
}

function getTrendingProfiles(offset, authUserId) {
    return knex('users_subscriptions')
        .select('user_id')
        .where('created_at', '>', lastWeek)
        .groupBy('user_id')
        .orderByRaw('COUNT(user_id) DESC')
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            return knex('users')
                .select(['id', 'username', 'fullname', 'avatar'])
                .where('id', _row.user_id)
                .first();
        })
        .map((_row) => { return _row ? getProfileFollowersCount(_row) : _row; })
        .map((_row) => { return _row ? getMySubscription(_row, authUserId) : _row; })
        .then((rows) => {
            return knex('users_subscriptions')
                .countDistinct('user_id')
                .where('created_at', '>', lastWeek)
                .first()
                .then((count) => { return { count: count.count, users: rows }; });
        });
}

function getSearchedProfiles(searchPattern, offset, authUserId) {
    return knex('users')
        .select(['id', 'username', 'fullname', 'avatar'])
        .whereRaw('LOWER(username) like ?', `%${searchPattern}%`)
        .orWhereRaw('LOWER(fullname) like ?', `%${searchPattern}%`)
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => { return _row ? getProfileFollowersCount(_row) : _row; })
        .map((_row) => { return _row ? getMySubscription(_row, authUserId) : _row; })
        .then((rows) => {
            return knex('users')
                .count('*')
                .whereRaw('LOWER(username) like ?', `%${searchPattern}%`)
                .orWhereRaw('LOWER(fullname) like ?', `%${searchPattern}%`)
                .first()
                .then((count) => { return { count: count.count, users: rows }; });
        });
}


/* subscriptions */

function createSubscription(newSubscription) {
    // upsert
    const insert = knex('users_subscriptions').insert(newSubscription);
    const update = knex('users_subscriptions').update(newSubscription);
    const query = util.format(
        '%s ON CONFLICT (user_id, sub_user_id) DO UPDATE SET %s RETURNING id',
        insert.toString(),
        update.toString().replace(/^update\s.*\sset\s/i, '')
    );
    return knex.raw(query).then(data => data.rows[0].id);
}

function getFollowers(userId, authUserId, offset) {
    return knex('users_subscriptions')
        .select(['subscriptions.id as subscription_id', 'sub_user_id as user_id',
            'username', 'fullname', 'avatar'])
        .rightJoin('users', 'users.id', 'subscriptions.sub_user_id')
        .where('user_id', userId)
        .andWhere('sub_user_id', '!=', authUserId)
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => { return _row ? getMySubscription(_row, authUserId) : _row; })
        .then((rows) => {
            return knex('users_subscriptions')
                .count('*')
                .where('user_id', userId)
                .andWhere('sub_user_id', '!=', authUserId)
                .first()
                .then((count) => { return { count: count.count, subscriptions: rows }; });
        });
}

function getFollowing(userId, authUserId, offset, limiter) {
    return knex('users_subscriptions')
        .select(['subscriptions.id as subscription_id', 'user_id',
            'username', 'fullname', 'avatar'])
        .rightJoin('users', 'users.id', 'subscriptions.user_id')
        .where('sub_user_id', userId)
        .andWhere('user_id', '!=', authUserId)
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => { return _row ? getMySubscription(_row, authUserId) : _row; })
        .then((rows) => {
            return knex('users_subscriptions')
                .count('*')
                .where('sub_user_id', userId)
                .andWhere('user_id', '!=', authUserId)
                .first()
                .then((count) => { return { count: count.count, subscriptions: rows }; });
        });
}

function getFollowingIds(userId, offset) {
    return knex('users_subscriptions')
        .select('user_id')
        .where('sub_user_id', userId)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset * limit);
}

function deleteSubscription(subscriptionId, userId) {
    return knex('users_subscriptions')
        .del()
        .where('id', subscriptionId)
        .andWhere('sub_user_id', userId)
        .then((data) => {
            return data === 1 ? subscriptionId :
                new Error('No found subscription or access is restricted');
        });
}

module.exports = {
    checkUser,
    comparePass,
    findProfileByName,
    findProfileByEmail,
    createUser,
    getUserData,
    getProfilesData,
    getTrendingProfiles,
    getSearchedProfiles,
    getProfileData,
    updateUser,
    deleteUser,
    createSubscription,
    getFollowers,
    getFollowing,
    getFollowingIds,
    deleteSubscription
};
