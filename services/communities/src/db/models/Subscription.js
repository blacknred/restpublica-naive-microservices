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

function getAllParticipants({ communityId, userId, adminId, pending, offset, reduced }) {
    // eslint-disable-next-line
    const approved = (userId !== adminId) ? true : pending ? false : (true || false);
    return knex('communities_subscriptions')
        .select(['communities_subscriptions.id as subscription_id', 'user_id'])
        .rightJoin('communities', 'communities.id', 'communities_subscriptions.community_id')
        .where('communities.id', communityId)
        .andWhere('user_id', '!=', userId)
        .andWhere({ approved })
        .orderBy('communities_subscriptions.created_at', 'DESC')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .then((profiles) => {
            return knex('communities_subscriptions')
                .count('*')
                .rightJoin('communities', 'communities.id',
                    'communities_subscriptions.community_id')
                .where('communities.id', communityId)
                .andWhere('user_id', '!=', userId)
                .andWhere({ approved })
                .first()
                .then(({ count }) => { return { count, profiles }; });
        });
}

function getAllModerators({ communityId, offset, reduced }) {
    return knex('communities_subscriptions')
        .select(['communities_subscriptions.id as subscription_id', 'user_id'])
        .where('communities.id', communityId)
        .andWhere('type', 'moderator')
        .orderBy('communities_subscriptions.created_at', 'DESC')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .then((profiles) => {
            return knex('communities_subscriptions')
                .count('*')
                .where('communities.id', communityId)
                .andWhere('type', 'moderator')
                .first()
                .then(({ count }) => { return { count, profiles }; });
        });
}

function deleteOne({ subscriptionId, communityId, userId }) {
    return knex('communities_subscriptions')
        .del()
        .where('id', subscriptionId)
        .andWhere('user_id', userId)
        .andWhere('community_id', communityId);
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
    getAllParticipants,
    getAllModerators,
    deleteOne,
    deleteAll
};
