/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable no-confusing-arrow */

const bcrypt = require('bcryptjs');
const knex = require('../../db/connection');

const LIMIT = 12;
const MOBILE_LIMIT = 6;

function comparePass(userPassword, databasePassword) {
    return bcrypt.compareSync(userPassword, databasePassword);
}

/* user */

function isExist(obj) {
    return knex('users')
        .select('id')
        .where(obj)
        .first();
}

function create(newUser) {
    const salt = bcrypt.genSaltSync();
    newUser.password = bcrypt.hashSync(newUser.password, salt);
    return knex('users')
        .insert(newUser)
        .returning(['id', 'username', 'avatar'])
        .first();
}

function getUser(userId) {
    return knex('users')
        .select('*')
        .where('id', userId)
        .andWhere({ active: true })
        .first();
}

function update(userObj, userId) {
    return knex('users')
        .update(userObj)
        .where('id', userId)
        .returning(`${Object.keys(userObj)[0]}`)
        .first();
}

/* profiles */

function mySubscription(user, authUserId) {
    return knex('users_subscriptions')
        .select('id')
        .where({ user_id: user.id, sub_user_id: authUserId })
        .first()
        .then(({ id }) => {
            return Object.assign(user, { my_subscription_id: id || null });
        });
}

function followersCount(user) {
    return knex('users_subscriptions')
        .count('*')
        .where('user_id', user.id)
        .first()
        .then(({ count }) => {
            return Object.assign(user, { followers_cnt: count });
        });
}

function followingCount(user) {
    return knex('users_subscriptions')
        .count('*')
        .where('sub_user_id', user.id)
        .first()
        .then(({ count }) => {
            return Object.assign(user, { following_cnt: count });
        });
}

function getOne(username, authUserId) {
    return knex('users')
        .select(['id', 'username', 'fullname', 'description', 'avatar'])
        .where({ username, active: true })
        .first()
        .then(_row => _row ? followersCount(_row) : _row)
        .then(_row => _row ? followingCount(_row) : _row)
        .then(_row => _row ? mySubscription(_row, authUserId) : _row);
}

function getAllInList(arr, authUserId, lim) {
    return knex('users')
        .select(lim || ['id', 'username', 'fullname', 'avatar'])
        .whereIn('id', arr)
        .andWhere({ active: true })
        .map(_row => _row && !lim ? mySubscription(_row, authUserId) : _row);
}

function getAllTrending(authUserId, offset, reduced) {
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(),
        today.getMonth(), today.getDate() - 14);
    return knex('users_subscriptions')
        .select('user_id')
        .where('created_at', '>', lastWeek)
        .groupBy('user_id')
        .orderByRaw('COUNT(user_id) DESC')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * reduced ? MOBILE_LIMIT : LIMIT)
        .map((_row) => {
            return knex('users')
                .select(['id', 'username', 'fullname', 'avatar'])
                .where('id', _row.user_id)
                .andWhere({ active: true })
                .first();
        })
        .map(_row => _row ? followersCount(_row) : _row)
        .map(_row => _row ? mySubscription(_row, authUserId) : _row)
        .then((profiles) => {
            return knex('users_subscriptions')
                .countDistinct('user_id')
                .where('created_at', '>', lastWeek)
                .first()
                .then(({ count }) => { return { count, profiles }; });
        });
}

function getAllSearched(pattern, authUserId, offset, reduced) {
    return knex('users')
        .select(['id', 'username', 'fullname', 'avatar'])
        .whereRaw('LOWER(username) like ?', `%${pattern}%`)
        .orWhereRaw('LOWER(fullname) like ?', `%${pattern}%`)
        .andWhere({ active: true })
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * reduced ? MOBILE_LIMIT : LIMIT)
        .map(_row => _row ? followersCount(_row) : _row)
        .map(_row => _row ? mySubscription(_row, authUserId) : _row)
        .then((profiles) => {
            return knex('users')
                .count('*')
                .whereRaw('LOWER(username) like ?', `%${pattern}%`)
                .orWhereRaw('LOWER(fullname) like ?', `%${pattern}%`)
                .andWhere({ active: true })
                .first()
                .then(({ count }) => { return { count, profiles }; });
        });
}

function deleteAllInactive() {
    const today = new Date();
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3);
    knex('users')
        .del()
        .where('active', false)
        .andWhere('activity_at', '>', threeMonthsAgo)
        .returning('id');
}


module.exports = {
    comparePass,
    isExist,
    create,
    getUser,
    update,
    getOne,
    getAllInList,
    getAllTrending,
    getAllSearched,
    deleteAllInactive
};
