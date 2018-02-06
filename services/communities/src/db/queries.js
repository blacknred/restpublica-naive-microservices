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


/* community */

function findCommunityByName(name) {
    return knex('communities')
        .select(['id', 'title'])
        .where('title', name)
        .first();
}

function createCommunity(newCommunity) {
    return knex('communities')
        .insert(newCommunity)
        .returning('*')
        .catch((err) => {
            return err;
        });
}

function updateCommunity(communityObj, communityId, adminId) {
    return knex('communities')
        .update(communityObj)
        .where('id', communityId)
        .andWhere('admin_id', adminId)
        .returning(`${Object.keys(communityObj)[0]}`)
        .catch((err) => {
            return err;
        });
}

function deleteCommunity(communityId, adminId) {
    return knex('communities')
        .del()
        .where('id', communityId)
        .andWhere('admin_id', adminId)
        .then((data) => {
            return data;
        })
        .catch((err) => {
            return err;
        });
}

function getMySubscriptionFromCommunityFollowers(community, userId) {
    return knex('communities_subscriptions')
        .select('id')
        .where({ community_id: community.id, user_id: userId, approved: true })
        .first()
        .then((row) => {
            community.my_subscription_id = row ? row.id : null;
            return community;
        });
}

function isIBannedFromCommunity(community, userId) {
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

function getCommunityFollowersCount(community) {
    return knex('communities_subscriptions')
        .count('*')
        .where({ community_id: community.id, approved: true })
        .first()
        .then((row) => {
            community.followers_count = row.count;
            return community;
        });
}

function getCommunityData(communityTitle, userId) {
    return knex('communities')
        .select('*')
        .where('title', communityTitle)
        .first()
        .then((_row) => {
            return getCommunityFollowersCount(_row);
        })
        .then((_row) => {
            return getMySubscriptionFromCommunityFollowers(_row, userId);
        })
        .then((_row) => {
            return isIBannedFromCommunity(_row, userId);
        })
        .then((row) => {
            return row;
        })
        .catch((err) => {
            return err;
        });
}

/* communities */

function getCommunitiesData(commArr, userId) {
    return knex('communities')
        .select(['id', 'title', 'avatar'])
        .whereIn('id', commArr)
        .then((rows) => {
            return rows;
        })
        .catch((err) => {
            return err;
        });
}

function getTrendingCommunities(userId, offset) {
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
                .select(['id', 'title', 'avatar'])
                .where('id', _row.community_id)
                .first();
        })
        .map((_row) => {
            if (_row) return getCommunityFollowersCount(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getMySubscriptionFromCommunityFollowers(_row, userId);
            return _row;
        })
        .map((_row) => {
            if (_row) return isIBannedFromCommunity(_row, userId);
            return _row;
        })
        .then((rows) => {
            return knex('communities_subscriptions')
                .countDistinct('community_id')
                .where('created_at', '>', lastWeek)
                .andWhere('approved', true)
                .first()
                .then((count) => {
                    return Object.assign(
                        {}, { count: count.count },
                        { communities: rows }
                    );
                });
        })
        .catch((err) => {
            return err;
        });
}

function getSearchedCommunities(searchPattern, userId, offset) {
    return knex('communities')
        .select(['id', 'title', 'avatar'])
        .whereRaw('LOWER(title) like ?', `%${searchPattern}%`)
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            if (_row) return getCommunityFollowersCount(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getMySubscriptionFromCommunityFollowers(_row, userId);
            return _row;
        })
        .map((_row) => {
            if (_row) return isIBannedFromCommunity(_row, userId);
            return _row;
        })
        .then((rows) => {
            return knex('users')
                .count('*')
                .whereRaw('LOWER(title) like ?', `%${searchPattern}%`)
                .first()
                .then((count) => {
                    return Object.assign(
                        {}, { count: count.count },
                        { communities: rows }
                    );
                });
        })
        .catch((err) => {
            return err;
        });
}

function getUserCommunities(userId, offset) {
    return knex('communities')
        .select(['id', 'title', 'avatar'])
        .where('admin_id', userId)
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            if (_row) return getCommunityFollowersCount(_row);
            return _row;
        })
        .then((rows) => {
            return knex('communities')
                .count('*')
                .where('admin_id', userId)
                .first()
                .then((count) => {
                    return Object.assign(
                        {}, { count: count.count },
                        { communities: rows }
                    );
                });
        })
        .catch((err) => {
            return err;
        });
}

/* subscriptions */

function getFollowers(id, userId, offset) {
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
                .then((count) => {
                    return Object.assign(
                        {}, { count: count.count },
                        { subscriptions: rows }
                    );
                });
        })
        .catch((err) => {
            return err;
        });
}

function getFollowingIds(userId, offset) {
    return knex('communities_subscriptions')
        .select('community_id')
        .where('user_id', userId)
        .andWhere('approved', true)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset * limit)
        .catch((err) => {
            return err;
        });
}

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
        })
        .catch((err) => {
            return err;
        });
}

function deleteSubscription(communityId, userId) {
    return knex('communities_subscriptions')
        .del()
        .where('community_id', communityId)
        .andWhere('user_id', userId)
        .then((data) => {
            return data === 1 ? communityId :
                new Error('No found subscription or access is restricted');
        })
        .catch((err) => {
            return err;
        });
}

/* bans */

function createBan(newBan) {
    return knex('communities_bans')
        .insert(newBan)
        .first()
        .then((data) => {
            return data.rows.id;
        })
        .catch((err) => {
            return err;
        });
}

function getBans(commId, userId, offset) {
    return knex('communities_bans')
        .select(['user_id', 'end_date'])
        .where('community_id', commId)
        .andWhere('end_date', '>', today)
        .limit(limit)
        .offset(offset * limit)
        .then((rows) => {
            return knex('communities')
                .count('*')
                .where('community_id', commId)
                .andWhere('end_date', '>', today)
                .first()
                .then((count) => {
                    return Object.assign(
                        {}, { count: count.count },
                        { users: rows }
                    );
                });
        })
        .catch((err) => {
            return err;
        });
}

module.exports = {
    findCommunityByName,
    createCommunity,
    updateCommunity,
    deleteCommunity,
    getCommunityData,
    getCommunitiesData,
    getTrendingCommunities,
    getSearchedCommunities,
    getUserCommunities,
    getFollowers,
    getFollowingIds,
    createSubscription,
    deleteSubscription,
    createBan,
    getBans
};
