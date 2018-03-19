/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
const util = require('util');
const knex = require('../db/../connection');

const LIMIT = 12;

/* subscriptions */

function createSubscription(newSubscription) {
    // upsert
    const insert = knex('communities_subscriptions').insert(newSubscription);
    const update = knex('communities_subscriptions').update(newSubscription);
    const query = util.format(
        '%s ON CONFLICT (community_id, user_id) DO UPDATE SET %s RETURNING id',
        insert.toString(),
        update.toString().replace(/^update\s.*\sset\s/i, '')
    );
    return knex.raw(query)
        .then((data) => { return { subscription_id: data.rows[0].id }; });
}

function getCommunityFollowers(id, userId, offset) {
    return knex('communities_subscriptions')
        .select(['communities_subscriptions.id', 'user_id'])
        .rightJoin('communities', 'communities.id', 'communities_subscriptions.community_id')
        .where('communities.id', id)
        .andWhere('user_id', '!=', userId)
        .andWhere('approved', true)
        .limit(LIMIT)
        .offset(offset * LIMIT)
        .then((rows) => {
            return knex('communities_subscriptions')
                .count('*')
                .rightJoin('communities', 'communities.id', 'communities_subscriptions.community_id')
                .where('communities.id', id)
                .andWhere('user_id', '!=', userId)
                .andWhere('approved', true)
                .first()
                .then((count) => { return { count: count.count, subscriptions: rows }; });
        });
}

function deleteSubscription(subscriptionId, communityId, userId) {
    return knex('communities_subscriptions')
        .del()
        .where('id', subscriptionId)
        .andWhere('community_id', communityId)
        .andWhere('user_id', userId)
        .then((data) => {
            if (data) return { subscription_id: subscriptionId };
            throw new Error('No found subscription or access is restricted');
        });
}

function deleteSubscriptions(communityId, adminId) {
    return knex('communities_subscriptions')
        .del()
        .leftJoin('communities', 'communities.id', 'communities_subscriptions.community_id')
        .where('community_id', communityId)
        .andWhere('communities.admin_id', adminId);
}

module.exports = {
    createSubscription,
    getCommunityFollowers,
    deleteSubscription,
    deleteSubscriptions
};
