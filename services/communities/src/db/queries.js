/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
const util = require('util');
const knex = require('../db/connection');
const localAuth = require('../auth/local');
const helpers = require('./_helpers');

const limit = 12;
const today = new Date();
const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 20);


/* communities */

function findCommunityByName(name) {
    return knex('communities')
        .select(['id', 'title'])
        .where({ name })
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
        .returning('*');
}

function updateCommunity(communityOpt, communityId, adminId) {
    return knex('communities')
        .update(communityOpt)
        .where('id', communityId)
        .andWhere('admin_id', adminId)
        .returning(`${Object.keys(communityOpt)[0]}`)
        .then((data) => {
            if (communityOpt.active) {
                return knex('communities_subscriptions')
                    .del()
                    .where('community_id', communityId);
            }
            return data;
        });
}

function deleteCommunity(communityId, adminId) {
    knex.transaction((trx) => {
        return knex('communities_subscriptions')
            .del()
            .leftJoin('communities', 'communities_subscriptions.community_id', 'communities.id')
            .where('community_id', communityId)
            .andWhere('communities.admin_id', adminId)
            .transacting(trx)
            .then((data) => {
                knex('communities')
                    .del()
                    .where('id', communityId)
                    .andWhere('admin_id', adminId)
                    .transacting(trx);
            })
            .then(trx.commit)
            .catch(trx.rollback);
    });
}

function getCommunity(name, lim, userId) {
    return knex('communities')
        .select(lim || '*')
        .where({ name, active: true })
        .first()
        .then(_row => getFollowersCount(_row))
        .then(_row => getMySubscription(_row, userId))
        .then(_row => isIBanned(_row, userId));
}

function getCommunities(arr, lim, userId) {
    return knex('communities')
        .select(lim || ['id', 'title', 'avatar'])
        .whereIn('id', arr)
        .map((_row) => { return _row && !lim ? getFollowersCount(_row) : _row; })
        .map((_row) => { return _row && !lim ? getMySubscription(_row, userId) : _row; });
}

function getTrendingCommunities(userId, lim, offset) {
    return knex('communities_subscriptions')
        .select('community_id')
        .where('created_at', '>', lastWeek)
        .andWhere('approved', true)
        .groupBy('community_id')
        .orderByRaw('COUNT(community_id) DESC')
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            return knex('communities')
                .select(lim || ['id', 'title', 'avatar'])
                .where('id', _row.community_id)
                .andWhere('active', true)
                .first();
        })
        .map((_row) => { return _row && !lim ? getFollowersCount(_row) : _row; })
        .map((_row) => { return _row && !lim ? getMySubscription(_row, userId) : _row; })
        .map((_row) => { return _row && !lim ? isIBanned(_row, userId) : _row; })
        .then((rows) => {
            if (lim) return rows;
            return knex('communities_subscriptions')
                .countDistinct('community_id')
                .where('created_at', '>', lastWeek)
                .andWhere('approved', true)
                .first()
                .then((count) => { return { count: count.count, communities: rows }; });
        });
}

function getSearchedCommunities(pattern, userId, lim, offset) {
    return knex('communities')
        .select(lim || ['id', 'title', 'avatar'])
        .whereRaw('LOWER(title) like ?', `%${pattern}%`)
        .andWhere('active', true)
        .orderBy('created_at', 'DESC')
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => { return _row && !lim ? getFollowersCount(_row) : _row; })
        .map((_row) => { return _row && !lim ? getMySubscription(_row, userId) : _row; })
        .map((_row) => { return _row && !lim ? isIBanned(_row, userId) : _row; })
        .then((rows) => {
            if (lim) return rows;
            return knex('communities')
                .count('*')
                .whereRaw('LOWER(title) like ?', `%${pattern}%`)
                .andWhere('active', true)
                .first()
                .then((count) => { return { count: count.count, communities: rows }; });
        });
}

function getCommunitiesByAdmin(adminId, lim, offset) {
    return knex('communities')
        .select(lim || ['id', 'title', 'avatar'])
        .where('admin_id', adminId)
        .andWhere('active', true)
        .orderBy('created_at', 'ASC')
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => { return _row && !lim ? getFollowersCount(_row) : _row; })
        .then((rows) => {
            if (lim) return rows;
            return knex('communities')
                .count('*')
                .where('admin_id', adminId)
                .andWhere('active', true)
                .first()
                .then((count) => { return { count: count.count, communities: rows }; });
        });
}

function getUserCommunities(userId, lim, offset) {
    return knex('communities_subscriptions')
        .select('community_id')
        .where('user_id', userId)
        .andWhere('approved', true)
        .orderBy('last_post_at', 'DESC')
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            return knex('communities')
                .select(lim || ['id', 'title', 'avatar'])
                .where('id', _row.community_id)
                .andWhere('active', true)
                .first();
        })
        .map((_row) => { return _row && !lim ? getFollowersCount(_row) : _row; })
        .map((_row) => { return _row && !lim ? getMySubscription(_row, userId) : _row; })
        .map((_row) => { return _row && !lim ? isIBanned(_row, userId) : _row; })
        .then((rows) => {
            if (lim) return rows;
            return knex('communities_subscriptions')
                .count('*')
                .where('user_id', userId)
                .andWhere('approved', true)
                .first()
                .then((count) => { return { count: count.count, communities: rows }; });
        });
}


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
        .first()
        .then((data) => {
            return data.rows.id;
        });
}

function getCommunityFollowers(id, userId, offset) {
    return knex('communities_subscriptions')
        .select(['id', 'user_id'])
        .rightJoin('communities', 'communities.id', 'communities_subscriptions.community_id')
        .where({ id })
        .andWhere('user_id', '!=', userId)
        .limit(limit)
        .offset(offset * limit)
        .then((rows) => {
            return knex('communities_subscriptions')
                .count('*')
                .rightJoin('communities', 'communities.id', 'communities_subscriptions.community_id')
                .where({ id })
                .andWhere('user_id', '!=', userId)
                .first()
                .then((count) => { return { count: count.count, subscriptions: rows }; });
        });
}

function deleteSubscription(id, communityId, userId) {
    return knex('communities_subscriptions')
        .del()
        .where({ id })
        .andWhere('community_id', communityId)
        .andWhere('user_id', userId)
        .then((data) => {
            return data === 1 ? communityId :
                new Error('No found subscription or access is restricted');
        });
}


/* bans */

function createBan(newBan) {
    return knex('communities_bans')
        .insert(newBan)
        .first()
        .then((data) => {
            return data.rows.id;
        });
}

function getBans(communityId, offset) {
    return knex('communities_bans')
        .select(['user_id', 'end_date'])
        .where('community_id', communityId)
        .andWhere('end_date', '>', today)
        .limit(limit)
        .offset(offset * limit)
        .then((rows) => {
            return knex('communities')
                .count('*')
                .where('community_id', communityId)
                .andWhere('end_date', '>', today)
                .first()
                .then((count) => { return { count: count.count, users: rows }; });
        });
}


module.exports = {
    findCommunityByName,
    createCommunity,
    getCommunities,
    getTrendingCommunities,
    getSearchedCommunities,
    getUserCommunities,
    getCommunitiesByAdmin,
    getCommunity,
    updateCommunity,
    deleteCommunity,
    createSubscription,
    getCommunityFollowers,
    deleteSubscription,
    createBan,
    getBans
};
