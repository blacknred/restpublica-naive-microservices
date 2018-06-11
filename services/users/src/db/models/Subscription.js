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
        .then(id => Object.assign(user, { my_subscription: id ? id.id : null }));
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
    return knex.raw(query).then(({ rows }) => rows[0].id);
}

function getAllFollowers({ profileId, userId, offset, reduced }) {
    return knex('users_subscriptions')
        .select(['users_subscriptions.id', 'users.username',
            'users.fullname', 'users.avatar'])
        .rightJoin('users', 'users.id', 'users_subscriptions.sub_user_id')
        .where('users_subscriptions.user_id', profileId)
        .andWhere('users.active', true)
        .andWhere('users_subscriptions.sub_user_id', '!=', userId)
        .orderBy('users_subscriptions.created_at', 'DESC')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => _row ? mySubscription(_row, userId) : _row)
        .then((subscriptions) => {
            return knex('users_subscriptions')
                .count('*')
                .rightJoin('users', 'users.id', 'users_subscriptions.sub_user_id')
                .where('users_subscriptions.user_id', profileId)
                .andWhere('users.active', true)
                .first()
                .then(({ count }) => { return { count, subscriptions }; });
        });
}

function getAllFollowing({ profileId, userId, offset, reduced }) {
    return knex('users_subscriptions')
        .select(['users_subscriptions.id', 'users.username',
            'users.fullname', 'users.avatar'])
        .rightJoin('users', 'users.id', 'users_subscriptions.user_id')
        .where('users_subscriptions.sub_user_id', profileId)
        .andWhere('users.active', true)
        .andWhere('user_id', '!=', userId)
        .orderBy('users_subscriptions.created_at', 'DESC')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => _row ? mySubscription(_row, userId) : _row)
        .then((subscriptions) => {
            return knex('users_subscriptions')
                .count('*')
                .rightJoin('users', 'users.id', 'users_subscriptions.user_id')
                .where('users_subscriptions.sub_user_id', profileId)
                .andWhere('users.active', true)
                .first()
                .then(({ count }) => { return { count, subscriptions }; });
        });
}

function getAllFeed(userId) {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(),
        today.getMonth(), today.getDate() - 90);
    return knex('users_subscriptions')
        .select('users_subscriptions.user_id')
        .rightJoin('users', 'users.id', 'users_subscriptions.user_id')
        .where('users_subscriptions.sub_user_id', userId)
        .andWhere('users.last_post_at', '>', lastMonth)
        .orderBy('users.last_post_at', 'DESC')
        .limit(100);
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
    getAllFeed,
    deleteOne,
    deleteAll
};
