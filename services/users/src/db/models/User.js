/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable no-confusing-arrow */

const bcrypt = require('bcryptjs');
const knex = require('../../db/connection');

const LIMIT = 12;
const MOBILE_LIMIT = 6;

function comparePass(userPassword, userId) {
    return knex('users')
        .select('password')
        .where({ id: userId })
        .first()
        .then(({ password }) => {
            return bcrypt.compareSync(userPassword, password);
        });
}

/* user */

function isExist(obj) {
    return knex('users')
        .select(['id', 'username', 'avatar', 'admin'])
        .where(obj)
        .first();
}

function create(newUser) {
    const salt = bcrypt.genSaltSync();
    newUser.password = bcrypt.hashSync(newUser.password, salt);
    return knex('users')
        .insert(newUser)
        .returning(['id', 'username', 'avatar'])
        .then(rows => rows[0]);
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
        .then(rows => rows[0]);
}

/* profiles */

function mySubscription(user, authUserId) {
    return knex('users_subscriptions')
        .select('id')
        .where({ user_id: user.id, sub_user_id: authUserId })
        .first()
        .then((id) => { return { ...user, my_subscription: id ? id.id : null }; });
}

function followersCount(user) {
    return knex('users_subscriptions')
        .count('*')
        .where('user_id', user.id)
        .first()
        .then(({ count }) => { return { ...user, followers_cnt: count }; });
}

function followingCount(user) {
    return knex('users_subscriptions')
        .count('*')
        .where('sub_user_id', user.id)
        .first()
        .then(({ count }) => { return { ...user, following_cnt: count }; });
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

function getAllInList({ list, userId, limiter }) {
    return knex('users')
        .select('id')
        .select(limiter || ['username', 'fullname', 'avatar'])
        .whereIn('id', list)
        .andWhere({ active: true })
        .map(_row => _row && !limiter ? mySubscription(_row, userId) : _row)
        .then((profiles) => { return { profiles }; });
}

function getAllTrending({ userId, offset, reduced }) {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(),
        today.getMonth(), today.getDate() - 31);
    return knex('users_subscriptions')
        .select('user_id')
        .where('created_at', '>', lastMonth)
        .groupBy('user_id')
        .orderByRaw('COUNT(user_id) DESC')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map((_row) => {
            return knex('users')
                .select(['id', 'username', 'fullname', 'avatar'])
                .where('id', _row.user_id)
                .andWhere({ active: true })
                .first();
        })
        .map(_row => _row ? followersCount(_row) : _row)
        .map(_row => _row ? mySubscription(_row, userId) : _row)
        .then((profiles) => {
            return knex('users_subscriptions')
                .countDistinct('user_id')
                .where('created_at', '>', lastMonth)
                .first()
                .then(({ count }) => { return { count, profiles }; });
        });
}

function getAllSearched({ query, userId, offset, reduced }) {
    return knex('users')
        .select(['id', 'username', 'fullname', 'avatar'])
        .whereRaw('LOWER(username) like ?', `%${query}%`)
        .orWhereRaw('LOWER(fullname) like ?', `%${query}%`)
        .andWhere({ active: true })
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => _row ? followersCount(_row) : _row)
        .map(_row => _row ? mySubscription(_row, userId) : _row)
        .then((profiles) => {
            return knex('users')
                .count('*')
                .whereRaw('LOWER(username) like ?', `%${query}%`)
                .orWhereRaw('LOWER(fullname) like ?', `%${query}%`)
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
        .andWhere('last_post_at', '>', threeMonthsAgo)
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
