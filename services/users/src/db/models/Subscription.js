/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable no-confusing-arrow */

const util = require('util');
const knex = require('../../db/connection');

const LIMIT = 12;
const MOBILE_LIMIT = 6;

/* subscriptions */

function mySubscription(user, authUserId) {
    return knex('users_subscriptions')
        .select('id')
        .where({ user_id: user.id, sub_user_id: authUserId })
        .first()
        .then((row) => {
            user.my_subscription_id = row ? row.id : null;
            return user;
        });
}

function isExist(subscriptionId) {
    return knex('users_subscriptions')
        .select('sub_user_id')
        .where('id', subscriptionId)
        .first();
}

function create(newSubscription) {
    const insert = knex('users_subscriptions').insert(newSubscription);
    const update = knex('users_subscriptions').update(newSubscription);
    const query = util.format(
        '%s ON CONFLICT (user_id, sub_user_id) DO UPDATE SET %s RETURNING id',
        insert.toString(),
        update.toString().replace(/^update\s.*\sset\s/i, '')
    );
    return knex.raw(query).then(data => data.rows[0]);
}

function getAllFollowers(userId, authUserId, offset, reduced) {
    return knex('users_subscriptions')
        .select(['users_subscriptions.id', 'users.username',
            'users.fullname', 'users.avatar'])
        .rightJoin('users', 'users.id', 'users_subscriptions.sub_user_id')
        .where('users_subscriptions.user_id', userId)
        .andWhere('users.active', true)
        .andWhere('users_subscriptions.sub_user_id', '!=', authUserId)
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * reduced ? MOBILE_LIMIT : LIMIT)
        .map(_row => _row ? mySubscription(_row, authUserId) : _row)
        .then((rows) => {
            return knex('users_subscriptions')
                .count('*')
                .rightJoin('users', 'users.id', 'users_subscriptions.sub_user_id')
                .where('users_subscriptions.user_id', userId)
                .andWhere('users.active', true)
                .first()
                .then((count) => { return { count: count.count, subscriptions: rows }; });
        });
}

function getAllFollowing(userId, authUserId, offset, reduced, limiter) {
    if (limiter) limiter = `users_subscriptions.${limiter}`;
    return knex('users_subscriptions')
        .select(limiter || ['users_subscriptions.id', 'users.username',
            'users.fullname', 'users.avatar'])
        .rightJoin('users', 'users.id', 'users_subscriptions.user_id')
        .where('users_subscriptions.sub_user_id', userId)
        .andWhere('users.active', true)
        .andWhere('user_id', '!=', authUserId)
        .orderBy('users.last_post_at', 'ASC')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * reduced ? MOBILE_LIMIT : LIMIT)
        .map(_row => _row && !limiter ? mySubscription(_row, authUserId) : _row)
        .then((rows) => {
            if (limiter) return { subscriptions: rows };
            return knex('users_subscriptions')
                .count('*')
                .rightJoin('users', 'users.id', 'users_subscriptions.user_id')
                .where('users_subscriptions.sub_user_id', userId)
                .andWhere('users.active', true)
                .first()
                .then((count) => { return { count: count.count, subscriptions: rows }; });
        });
}

function deleteOne(subscriptionId, userId) {
    return knex('users_subscriptions')
        .del()
        .where('id', subscriptionId)
        .andWhere('sub_user_id', userId);
}

function deleteAll(userId) {
    return knex('users_subscriptions')
        .del()
        .where('sub_user_id', userId)
        .andWhere('user_id', userId);
}


module.exports = {
    isExist,
    create,
    getAllFollowers,
    getAllFollowing,
    deleteOne,
    deleteAll
};
