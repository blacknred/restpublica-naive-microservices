const knex = require('../db/../connection');

const LIMIT = 12;
const MOBILE_LIMIT = 6;
const OBSERVABLE_PERIOD = 60;

/* communities */

function isExist(obj) {
    return knex('communities')
        .select(['id', 'admin_id'])
        .where(obj)
        .first();
}

function mySubscription(community, userId) {
    return knex('communities_subscriptions')
        .select('id')
        .where({ community_id: community.id, user_id: userId })
        .andWhere({ approved: true })
        .first()
        .then(id => ({ ...community, my_subscription: id ? id.id : null }));
}

function followersCount(community) {
    return knex('communities_subscriptions')
        .count('*')
        .where({ community_id: community.id, approved: true })
        .first()
        .then(({ count }) => ({ ...community, followers_cnt: count }));
}

function getLastSubscriptions(community) {
    return knex('communities_subscriptions')
        .select('user_id')
        .where('community_id', community.id)
        .andWhere('approved', true)
        .orderBy('created_at', 'desc')
        .limit(5)
        .then(rows => ({ ...community, last_members: rows }));
}

function create(newCommunity) {
    return knex('communities')
        .insert(newCommunity)
        .returning('*')
        .first();
}

function update(communityObj, communityId) {
    return knex('communities')
        .update(communityObj)
        .update('updated_at', knex.fn.now())
        .where('id', communityId)
        .returning(`${Object.keys(communityObj)[0]}`);
}

function getOne(name, userId) {
    return knex('communities')
        .select('*')
        .where('name', name)
        .andWhere('active', true)
        .first()
        .then(_row => (_row ? followersCount(_row) : _row))
        .then(_row => (_row ? mySubscription(_row, userId) : _row))
        .then(_row => (_row ? getLastSubscriptions(_row) : _row));
}


function getAllByProfile({ profileId, userId, offset, reduced }) {
    return knex('communities')
        .select(['communities.id', 'name', 'title', 'avatar', 'restricted', 'admin_id'])
        .rightJoin('communities_subscriptions',
            'communities_subscriptions.community_id', 'communities.id')
        .where('communities_subscriptions.user_id', profileId)
        .andWhere('communities_subscriptions.approved', true)
        .andWhere('communities.active', true)
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => (_row ? followersCount(_row) : _row))
        .map(_row => (_row ? mySubscription(_row, userId) : _row))
        .then((communities) => {
            return knex('communities')
                .count('*')
                .rightJoin('communities_subscriptions',
                    'communities_subscriptions.community_id', 'communities.id')
                .where('communities_subscriptions.user_id', profileId)
                .andWhere('communities_subscriptions.approved', true)
                .andWhere('communities.active', true)
                .first()
                .then(({ count }) => ({ count, communities }));
        });
}

function getAllByProfileCount(userId) {
    return knex('communities')
        .count('*')
        .rightJoin('communities_subscriptions',
            'communities_subscriptions.community_id', 'communities.id')
        .where('communities_subscriptions.user_id', userId)
        .andWhere('communities_subscriptions.approved', true)
        .andWhere('communities.active', true)
        .first()
        .then(({ count }) => ({ count }));
}

function getAllFeedByProfile(userId) {
    const today = new Date();
    const period = new Date(today.getFullYear(),
        today.getMonth(), today.getDate() - OBSERVABLE_PERIOD);
    return knex('communities')
        .select('communities.id')
        .rightJoin('communities_subscriptions',
            'communities_subscriptions.community_id', 'communities.id')
        .where('communities_subscriptions.user_id', userId)
        .andWhere('communities_subscriptions.approved', true)
        .andWhere('communities.last_post_at', '>', period)
        .orderBy('communities.last_post_at', 'DESC')
        .limit(100)
        .then(communities => ({ communities }));
}

function getAllByAdmin({ userId, offset, reduced }) {
    return knex('communities')
        .select(['id', 'title', 'avatar', 'name', 'restricted', 'last_post_at', 'admin_id'])
        .where('admin_id', userId)
        .andWhere('active', true)
        .orderBy('created_at', 'ASC')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => (_row ? followersCount(_row) : _row))
        .then((communities) => {
            return knex('communities')
                .count('*')
                .where('admin_id', userId)
                .andWhere('active', true)
                .first()
                .then(({ count }) => ({ count, communities }));
        });
}

function getAllInList({ list, userId, limiter }) {
    return knex('communities')
        .select('id')
        .select(limiter || ['title', 'name', 'avatar'])
        .whereIn('id', list)
        .andWhere({ active: true })
        .map(_row => (_row && !limiter ? followersCount(_row) : _row))
        .map(_row => (_row && !limiter ? mySubscription(_row, userId) : _row))
        .then(communities => ({ communities }));
}

function getAllTrending({ userId, offset, reduced }) {
    const today = new Date();
    const period = new Date(today.getFullYear(),
        today.getMonth(), today.getDate() - OBSERVABLE_PERIOD);
    return knex('communities_subscriptions')
        .select('community_id')
        .where('created_at', '>', period)
        .andWhere('approved', true)
        .groupBy('community_id')
        .orderByRaw('COUNT(community_id) DESC')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map((_row) => {
            return knex('communities')
                .select(['id', 'name', 'title', 'avatar', 'restricted', 'admin_id'])
                .where('id', _row.community_id)
                .andWhere('active', true)
                .first();
        })
        .map(_row => (_row ? followersCount(_row) : _row))
        .map(_row => (_row ? mySubscription(_row, userId) : _row))
        .then((communities) => {
            return knex('communities_subscriptions')
                .countDistinct('community_id')
                .where('created_at', '>', period)
                .andWhere('approved', true)
                .first()
                .then(({ count }) => ({ count, communities }));
        });
}

function getAllSearched({ query, userId, offset, reduced }) {
    return knex('communities')
        .select(['id', 'name', 'title', 'avatar', 'restricted', 'admin_id'])
        .whereRaw('LOWER(title) like ?', `%${query}%`)
        .andWhere('active', true)
        .orderBy('created_at', 'DESC')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => (_row ? followersCount(_row) : _row))
        .map(_row => (_row ? mySubscription(_row, userId) : _row))
        .then((communities) => {
            return knex('communities')
                .count('*')
                .whereRaw('LOWER(title) like ?', `%${query}%`)
                .andWhere('active', true)
                .first()
                .then(({ count }) => ({ count, communities }));
        });
}

function deleteAllInactive() {
    const today = new Date();
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1);
    knex('communities')
        .del()
        .where('active', false)
        .andWhere('last_post_at', '>', monthAgo)
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
    getAllByProfile,
    getAllByProfileCount,
    getAllFeedByProfile,
    getAllByAdmin,
    deleteAllInactive,
};
