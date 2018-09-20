const util = require('util');

const knex = require('../../db/connection');

const LIMIT = 12;
const MOBILE_LIMIT = 6;
const OBSERVABLE_PERIOD = 60;

/* subscriptions */

function mySubscription(user, authUserId) {
    return knex('users_subscriptions')
        .select('id')
        .where({ user_id: user.user_id, sub_user_id: authUserId })
        .first()
        .then(id => ({ ...user, my_subscription: id ? id.id : null }));
}

function followersCount(user) {
    return knex('users_subscriptions')
        .count('*')
        .where('user_id', user.user_id)
        .first()
        .then(({ count }) => ({ ...user, followers_cnt: count }));
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
        .select(['users_subscriptions.id', 'users_subscriptions.sub_user_id as user_id',
            'users.username', 'users.fullname', 'users.avatar'])
        .select(knex.raw('left (users.description, 30) as description'))
        .rightJoin('users', 'users.id', 'users_subscriptions.sub_user_id')
        .where('users_subscriptions.user_id', profileId)
        .andWhere('users.active', true)
        .andWhere('users_subscriptions.sub_user_id', '!=', userId)
        .orderBy('users_subscriptions.created_at', 'DESC')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => (_row ? mySubscription(_row, userId) : _row))
        .map(_row => (_row ? followersCount(_row) : _row))
        .then((profiles) => {
            return knex('users_subscriptions')
                .count('*')
                .rightJoin('users', 'users.id', 'users_subscriptions.sub_user_id')
                .where('users_subscriptions.user_id', profileId)
                .andWhere('users.active', true)
                .first()
                .then(({ count }) => ({ count, profiles }));
        });
}

function getAllFollowing({ profileId, userId, offset, reduced }) {
    return knex('users_subscriptions')
        .select(['users_subscriptions.id', 'users_subscriptions.user_id as user_id',
            'users.username', 'users.fullname', 'users.avatar'])
        .select(knex.raw('left (users.description, 30) as description'))
        .rightJoin('users', 'users.id', 'users_subscriptions.user_id')
        .where('users_subscriptions.sub_user_id', profileId)
        .andWhere('users.active', true)
        .andWhere('user_id', '!=', userId)
        .orderBy('users_subscriptions.created_at', 'DESC')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => (_row ? mySubscription(_row, userId) : _row))
        .map(_row => (_row ? followersCount(_row) : _row))
        .then((profiles) => {
            return knex('users_subscriptions')
                .count('*')
                .rightJoin('users', 'users.id', 'users_subscriptions.user_id')
                .where('users_subscriptions.sub_user_id', profileId)
                .andWhere('users.active', true)
                .first()
                .then(({ count }) => ({ count, profiles }));
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

function getAllFeed(userId) {
    const today = new Date();
    const period = new Date(today.getFullYear(),
        today.getMonth(), today.getDate() - OBSERVABLE_PERIOD);
    return knex('users_subscriptions')
        .select('users_subscriptions.user_id')
        .rightJoin('users', 'users.id', 'users_subscriptions.user_id')
        .where('users_subscriptions.sub_user_id', userId)
        .andWhere('users.last_post_at', '>', period)
        .orderBy('users.last_post_at', 'DESC')
        .limit(100);
}

module.exports = {
    isExist,
    create,
    deleteOne,
    deleteAll,
    getAllFollowers,
    getAllFollowing,
    getAllFeed
};
