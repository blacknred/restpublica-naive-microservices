/* eslint-disable no-param-reassign */
/* eslint-disable no-confusing-arrow */

const knex = require('../db/../connection');

const LIMIT = 12;
const MOBILE_LIMIT = 6;

/* communities */

function isExist(obj) {
    return knex('communities')
        .select('id')
        .where(obj)
        .first();
}

function mySubscription(community, userId) {
    return knex('communities_subscriptions')
        .select('id')
        .where({ community_id: community.id, user_id: userId })
        .andWhere({ approved: true })
        .first()
        .then(({ id }) => {
            return Object.assign(community, { my_subscription_id: id || null });
        });
}

function followersCount(community) {
    return knex('communities_subscriptions')
        .count('*')
        .where({ community_id: community.id, approved: true })
        .first()
        .then(({ count }) => {
            return Object.assign(community, { followers_cnt: count });
        });
}

function create(newCommunity) {
    return knex('communities')
        .insert(newCommunity)
        .returning('*')
        .first();
}

function update(communityObj, communityId, adminId) {
    return knex('communities')
        .update(communityObj)
        .where('id', communityId)
        .andWhere('admin_id', adminId)
        .returning(`${Object.keys(communityObj)[0]}`)
        .first();
}

function getOne(name, userId) {
    return knex('communities')
        .select('*')
        .where('communities.name', name)
        .andWhere('communities.active', true)
        .first()
        .then(_row => _row ? followersCount(_row) : _row)
        .then(_row => _row ? mySubscription(_row, userId) : _row);
}


function getAllByUser(userId, authUserId, offset, reduced) {
    return knex('communities')
        .select(['communities.id', 'title', 'avatar'])
        .rightJoin('communities_subscriptions',
            'communities_subscriptions.community_id', 'communities.id')
        .where('communities_subscriptions.user_id', userId)
        .andWhere('communities_subscriptions.approved', true)
        .andWhere('communities.active', true)
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * reduced ? MOBILE_LIMIT : LIMIT)
        .map(_row => _row ? followersCount(_row) : _row)
        .map(_row => _row ? mySubscription(_row, userId) : _row)
        .then((communities) => {
            return knex('communities')
                .count('*')
                .rightJoin('communities_subscriptions',
                    'communities_subscriptions.community_id', 'communities.id')
                .where('communities_subscriptions.user_id', userId)
                .andWhere('communities_subscriptions.approved', true)
                .andWhere('communities.active', true)
                .first()
                .then(({ count }) => { return { count, communities }; });
        });
}

function getAllByAdmin(adminId, offset, reduced) {
    return knex('communities')
        .select(['id', 'title', 'avatar', 'last_post_at'])
        .where('admin_id', adminId)
        .andWhere('active', true)
        .orderBy('created_at', 'ASC')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * reduced ? MOBILE_LIMIT : LIMIT)
        .map(_row => _row ? followersCount(_row) : _row)
        .then((communities) => {
            return knex('communities')
                .count('*')
                .where('admin_id', adminId)
                .andWhere('active', true)
                .first()
                .then(({ count }) => { return { count, communities }; });
        });
}

function getAllFollowing(userId) {
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(),
        today.getMonth(), today.getDate() - 14);
    return knex('communities_subscriptions')
        .select('communiries_subscriptions.id')
        .rightJoin('communiries', 'communiries.id',
            'communiries_subscriptions.communiries_id')
        .where('communiries_subscriptions.user_id', userId)
        .andWhere('communiries.last_post_at', '>', lastWeek)
        .orderBy('communiries.last_post_at', 'DESC')
        .limit(100);
}


function getAllInList(arr, userId, lim) {
    return knex('communities')
        .select(lim || ['id', 'title', 'name', 'avatar'])
        .whereIn('id', arr)
        .andWhere({ active: true })
        .map(_row => _row && !lim ? followersCount(_row) : _row)
        .map(_row => _row && !lim ? mySubscription(_row, userId) : _row);
}

function getAllTrending(userId, offset, reduced) {
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(),
        today.getMonth(), today.getDate() - 14);
    return knex('communities_subscriptions')
        .select('community_id')
        .where('created_at', '>', lastWeek)
        .andWhere('approved', true)
        .groupBy('community_id')
        .orderByRaw('COUNT(community_id) DESC')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * reduced ? MOBILE_LIMIT : LIMIT)
        .map((_row) => {
            return knex('communities')
                .select(['id', 'title', 'avatar'])
                .where('id', _row.community_id)
                .andWhere('active', true)
                .first();
        })
        .map(_row => _row ? followersCount(_row) : _row)
        .map(_row => _row ? mySubscription(_row, userId) : _row)
        .then((communities) => {
            return knex('communities_subscriptions')
                .countDistinct('community_id')
                .where('created_at', '>', lastWeek)
                .andWhere('approved', true)
                .first()
                .then(({ count }) => { return { count, communities }; });
        });
}

function getAllSearched(pattern, userId, offset, reduced) {
    return knex('communities')
        .select(['id', 'title', 'avatar'])
        .whereRaw('LOWER(title) like ?', `%${pattern}%`)
        .andWhere('active', true)
        .orderBy('created_at', 'DESC')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * reduced ? MOBILE_LIMIT : LIMIT)
        .map(_row => _row ? followersCount(_row) : _row)
        .map(_row => _row ? mySubscription(_row, userId) : _row)
        .then((communities) => {
            return knex('communities')
                .count('*')
                .whereRaw('LOWER(title) like ?', `%${pattern}%`)
                .andWhere('active', true)
                .first()
                .then(({ count }) => { return { count, communities }; });
        });
}

function deleteAllInactive() {
    const today = new Date();
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1);
    knex('communities')
        .del()
        .where('active', false)
        .andWhere('activity_at', '>', monthAgo)
        .returning('id');
}

module.exports = {
    isExist,
    create,
    getOne,
    update,
    getAllInList,
    getAllTrending,
    getAllSearched,
    getAllByUser,
    getAllByAdmin,
    getAllFollowing,
    deleteAllInactive,
};
