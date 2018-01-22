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
        .where('title', name)
        .first();
}

function getMySubscriptionFromCommunityFollowers(community, authUserId) {
    return knex('communities_subscriptions')
        .select('id')
        .where({ community_id: community.community_id, user_id: authUserId })
        .first()
        .then((row) => {
            community.my_subscription_id = row ? row.id : null;
            return community;
        });
}

function getCommunityFollowersCount(community) {
    return knex('communities_subscriptions')
        .count('*')
        .where('community_id', community.community_id)
        .first()
        .then((row) => {
            community.followers_count = row.count;
            return community;
        });
}


function getCommunityData(name, authUserId) {
    return knex('communities')
        .select(['id as community_id', 'title', 'description', 'avatar', 'background', 'admin_id'])
        .where('title', name)
        .first()
        .then((_row) => {
            return getCommunityFollowersCount(_row);
        })
        .then((_row) => {
            return getMySubscriptionFromCommunityFollowers(_row, authUserId);
        })
        .then((row) => {
            return row;
        })
        .catch((err) => {
            return err;
        });
}

function getTrendingCommunities(offset, authUserId) {
    return knex('communities_subscriptions')
        .select('community_id')
        .where('created_at', '>', lastWeek)
        .groupBy('user_id')
        .orderByRaw('COUNT(user_id) DESC')
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            return knex('communities')
                .select(['id as community_id', 'title'])
                .where('id', _row.community_id)
                .first();
        })
        .map((_row) => {
            if (_row) return getCommunityFollowersCount(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getMySubscriptionFromCommunityFollowers(_row, authUserId);
            return _row;
        })
        .then((rows) => {
            return knex('users_subscriptions')
                .countDistinct('user_id')
                .where('created_at', '>', lastWeek)
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

function getSearchedCommunities(searchPattern, offset, authUserId) {
    return knex('users')
        .select(['id as user_id', 'username', 'fullname', 'avatar'])
        .whereRaw('LOWER(username) like ?', `%${searchPattern}%`)
        .orWhereRaw('LOWER(fullname) like ?', `%${searchPattern}%`)
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            if (_row) return getCommunityFollowersCount(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getMySubscriptionFromCommunityFollowers(_row, authUserId);
            return _row;
        })
        .then((rows) => {
            return knex('users')
                .count('*')
                .whereRaw('LOWER(username) like ?', `%${searchPattern}%`)
                .orWhereRaw('LOWER(fullname) like ?', `%${searchPattern}%`)
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



function getProfileCommunities(userId) {
    return knex('users')
        .select(['username', 'fullname', 'description', 'email', 'avatar'])
        .where('id', userId)
        .first()
        .catch((err) => {
            return err;
        });
}

/* communities subscriptions */

function getFollowing(userId, offset, authUserId) {
    return knex('users_subscriptions')
        .select(['subscriptions.id as subscription_id', 'user_id',
            'username', 'fullname', 'avatar'])
        .rightJoin('users', 'users.id', 'subscriptions.user_id')
        .where('sub_user_id', userId)
        .andWhere('user_id', '!=', authUserId)
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            if (_row) return getMySubscriptionFromUserFollowers(_row, authUserId);
            return _row;
        })
        .then((rows) => {
            return knex('users_subscriptions')
                .count('*')
                .where('sub_user_id', userId)
                .andWhere('user_id', '!=', authUserId)
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

function getFollowingIds(userId) {
    return knex('users_subscriptions')
        .select('user_id')
        .where('sub_user_id', userId)
        .orderBy('created_at', 'desc')
        // ? limit
        // .then((rows) => {
        //     return rows;
        // })
        .catch((err) => {
            return err;
        });
}

function createSubscription(newSubscription) {
    // upsert
    const insert = knex('users_subscriptions').insert(newSubscription);
    const update = knex('users_subscriptions').update(newSubscription);
    const query = util.format(
        '%s ON CONFLICT (user_id, sub_user_id) DO UPDATE SET %s RETURNING id',
        insert.toString(),
        update.toString().replace(/^update\s.*\sset\s/i, '')
    );
    return knex.raw(query)
        .then((data) => {
            return data.rows[0].id;
        })
        .catch((err) => {
            return err;
        });
}

function deleteSubscription(subscriptionId, userId) {
    return knex('users_subscriptions')
        .del()
        .where('id', subscriptionId)
        .andWhere('sub_user_id', userId)
        .then((data) => {
            return data === 1 ? subscriptionId :
                new Error('No found subscription or access is restricted');
        })
        .catch((err) => {
            return err;
        });
}


module.exports = {
    ensureAuthenticated,
    comparePass,
    findUserByName,
    findUserByEmail,
    createUser,
    getUserData,
    getUsersData,
    getTrendingUsers,
    getSearchedUsers,
    getProfileData,
    updateUser,
    updateUserAvatar,
    getFollowers,
    getFollowing,
    getFollowingIds,
    createSubscription,
    deleteSubscription,

    findCommunityByName,
    getCommunityData,
    getTrendingCommunities,
    getSearchedCommunities
};
