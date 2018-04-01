/* eslint-disable no-confusing-arrow */

const util = require('util');
const knex = require('../db/../connection');

const LIMIT = 12;
const MOBILE_LIMIT = 6;

/* subscriptions */

function isExist(subscriptionId) {
    return knex('communities_subscriptions')
        .select('user_id')
        .where('id', subscriptionId)
        .andWhere('approved', true)
        .first();
}

function create(newSubscription) {
    // upsert
    const insert = knex('communities_subscriptions').insert(newSubscription);
    const update = knex('communities_subscriptions').update(newSubscription);
    const query = util.format(
        '%s ON CONFLICT (community_id, user_id) DO UPDATE SET %s RETURNING id',
        insert.toString(),
        update.toString().replace(/^update\s.*\sset\s/i, '')
    );
    return knex.raw(query).then(({ rows }) => rows[0].id);
}

function getAllFollowers({ communityId, userId, adminId, pending, offset, reduced }) {
    const isAdmin = userId === adminId;
    return knex('communities_subscriptions')
        .select(['communities_subscriptions.id', 'user_id'])
        .rightJoin('communities', 'communities.id', 'communities_subscriptions.community_id')
        .where('communities.id', communityId)
        .andWhere('user_id', '!=', userId)
        // eslint-disable-next-line
        .andWhere({ approved: !isAdmin ? true : pending ? false : true || false })
        .orderBy('communities_subscriptions.created_at', 'DESC')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .then((subscriptions) => {
            return knex('communities_subscriptions')
                .count('*')
                .rightJoin('communities', 'communities.id',
                    'communities_subscriptions.community_id')
                .where('communities.id', communityId)
                .andWhere('user_id', '!=', userId)
                // eslint-disable-next-line
                .andWhere({ approved: !isAdmin ? true : pending ? false : true || false })
                .first()
                .then(({ count }) => { return { count, subscriptions }; });
        });
}

function deleteOne({ subscriptionId, communityId, userId }) {
    return knex('communities_subscriptions')
        .del()
        .leftJoin('communities', 'communities.id', 'communities_subscriptions.community_id')
        .where('community_id', communityId)
        .where('communities_subscriptions.id', subscriptionId)
        .andWhere('communities_subscriptions.community_id', communityId)
        .andWhere('communities.admin_id', userId);
}

function deleteAll(communityId, adminId) {
    return knex('communities_subscriptions')
        .del()
        .leftJoin('communities', 'communities.id', 'communities_subscriptions.community_id')
        .where('community_id', communityId)
        .andWhere('communities.admin_id', adminId);
}

module.exports = {
    isExist,
    create,
    getAllFollowers,
    deleteOne,
    deleteAll
};
