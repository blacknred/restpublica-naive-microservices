/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */

const knex = require('../db/../connection');

const LIMIT = 12;

/* communities */

function findCommunityByName(name) {
    return knex('communities')
        .select(['id', 'title'])
        .where({ name })
        .first();
}

function findCommunityById(id) {
    return knex('communities')
        .select(['id', 'admin_id', 'restricted'])
        .where({ id })
        .first();
}

function getMySubscription(community, userId) {
    return knex('communities_subscriptions')
        .select('id')
        .where({ community_id: community.id, user_id: userId, approved: true })
        .first()
        .then((row) => {
            community.my_subscription_id = row ? row.id : null;
            return community;
        });
}

function isIBanned(community, userId) {
    return knex('communities_bans')
        .select('end_date')
        .where('community_id', community.id)
        .andWhere('user_id', userId)
        .first()
        .then((row) => {
            community.is_i_banned = row ? row.end_date : null;
            return community;
        });
}

function getFollowersCount(community) {
    return knex('communities_subscriptions')
        .count('*')
        .where({ community_id: community.id, approved: true })
        .first()
        .then((row) => {
            community.followers_count = row.count;
            return community;
        });
}

function createCommunity(newCommunity) {
    return knex('communities')
        .insert(newCommunity)
        .returning('*')
        .then(data => data[0]);
}

function updateCommunity(communityOpt, communityId, adminId) {
    return knex('communities')
        .update(communityOpt)
        .where('id', communityId)
        .andWhere('admin_id', adminId)
        .returning(`${Object.keys(communityOpt)[0]}`)
        .then(data => data[0]);
}

function getCommunity(name, lim, userId) {
    return knex('communities')
        .select(lim || '*')
        .where({ name, active: true })
        .first()
        .then((_row) => {
            if (lim) return _row;
            return getFollowersCount(_row);
        })
        .then((_row) => {
            if (lim) return _row;
            return isIBanned(_row, userId);
        })
        .then((_row) => {
            if (lim) return _row;
            return getMySubscription(_row, userId);
        });
}

function getCommunities(arr, userId) {
    return knex('communities')
        .select(['id', 'title', 'avatar'])
        .whereIn('id', arr)
        .andWhere({ active: true })
        .map((_row) => { return _row ? getFollowersCount(_row) : _row; })
        .map((_row) => { return _row ? getMySubscription(_row, userId) : _row; })
        .then((communities) => { return { communities }; });
}

function getTrendingCommunities(userId, offset) {
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 20);
    return knex('communities_subscriptions')
        .select('community_id')
        .where('created_at', '>', lastWeek)
        .andWhere('approved', true)
        .groupBy('community_id')
        .orderByRaw('COUNT(community_id) DESC')
        .limit(LIMIT)
        .offset(offset * LIMIT)
        .map((_row) => {
            return knex('communities')
                .select(['id', 'title', 'avatar'])
                .where('id', _row.community_id)
                .andWhere('active', true)
                .first();
        })
        .map((_row) => { return _row ? getFollowersCount(_row) : _row; })
        .map((_row) => { return _row ? getMySubscription(_row, userId) : _row; })
        .map((_row) => { return _row ? isIBanned(_row, userId) : _row; })
        .then((rows) => {
            return knex('communities_subscriptions')
                .countDistinct('community_id')
                .where('created_at', '>', lastWeek)
                .andWhere('approved', true)
                .first()
                .then((count) => { return { count: count.count, communities: rows }; });
        });
}

function getSearchedCommunities(pattern, userId, offset) {
    return knex('communities')
        .select(['id', 'title', 'avatar'])
        .whereRaw('LOWER(title) like ?', `%${pattern}%`)
        .andWhere('active', true)
        .orderBy('created_at', 'DESC')
        .limit(LIMIT)
        .offset(offset * LIMIT)
        .map((_row) => { return _row ? getFollowersCount(_row) : _row; })
        .map((_row) => { return _row ? getMySubscription(_row, userId) : _row; })
        .map((_row) => { return _row ? isIBanned(_row, userId) : _row; })
        .then((rows) => {
            return knex('communities')
                .count('*')
                .whereRaw('LOWER(title) like ?', `%${pattern}%`)
                .andWhere('active', true)
                .first()
                .then((count) => { return { count: count.count, communities: rows }; });
        });
}

function getCommunitiesByAdmin(adminId, offset) {
    return knex('communities')
        .select(['id', 'title', 'avatar'])
        .where('admin_id', adminId)
        .andWhere('active', true)
        .orderBy('created_at', 'ASC')
        .limit(LIMIT)
        .offset(offset * LIMIT)
        .map((_row) => { return _row ? getFollowersCount(_row) : _row; })
        .then((rows) => {
            return knex('communities')
                .count('*')
                .where('admin_id', adminId)
                .andWhere('active', true)
                .first()
                .then((count) => { return { count: count.count, communities: rows }; });
        });
}

function getUserCommunities(userId, authUserId, lim, offset) {
    if (lim) lim = `communities.${lim}`;
    return knex('communities')
        .select(lim || ['communities.id', 'title', 'avatar'])
        .rightJoin('communities_subscriptions',
            'communities_subscriptions.community_id', 'communities.id')
        .where('communities_subscriptions.user_id', userId)
        .andWhere('communities_subscriptions.approved', true)
        .andWhere('communities.active', true)
        .orderBy('communities.last_post_at', 'DESC')
        .limit(LIMIT)
        .offset(offset * LIMIT)
        .map((_row) => {
            if (lim) return _row;
            return _row ? getFollowersCount(_row) : _row;
        })
        .map((_row) => {
            if (lim) return _row;
            return _row ? getMySubscription(_row, authUserId) : _row;
        })
        .map((_row) => {
            if (lim) return _row;
            return _row ? isIBanned(_row, userId) : _row;
        })
        .then((rows) => {
            if (lim) return { communities: rows };
            return knex('communities')
                .count('*')
                .rightJoin('communities_subscriptions',
                    'communities_subscriptions.community_id', 'communities.id')
                .where('communities_subscriptions.user_id', userId)
                .andWhere('communities_subscriptions.approved', true)
                .andWhere('communities.active', true)
                .first()
                .then((count) => { return { count: count.count, communities: rows }; });
        });
}

function deleteCommunities() {
    const today = new Date();
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1);
    knex('communities')
        .del()
        .where('active', false)
        .andWhere('activity_at', '>', monthAgo)
        .returning('id');
}

module.exports = {
    findCommunityByName,
    findCommunityById,
    createCommunity,
    getCommunity,
    updateCommunity,
    getCommunities,
    getTrendingCommunities,
    getSearchedCommunities,
    getUserCommunities,
    getCommunitiesByAdmin,
    deleteCommunities,
};
