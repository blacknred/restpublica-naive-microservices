const bcrypt = require('bcryptjs');

const knex = require('../../db/connection');

const LIMIT = 12;
const MOBILE_LIMIT = 6;
const OBSERVABLE_PERIOD = 60;

function comparePass(userPassword, userId) {
    return knex('users')
        .select('password')
        .where({ id: userId })
        .first()
        .then(({ password }) => bcrypt.compareSync(userPassword, password));
}

/* user */

function isExist(obj) {
    return knex('users')
        .select(['id', 'username', 'avatar', 'admin', 'feed_rand'])
        .where(obj)
        .first();
}

function create(newUser) {
    const salt = bcrypt.genSaltSync();
    const password = bcrypt.hashSync(newUser.password, salt);
    return knex('users')
        .insert({ ...newUser, password })
        .returning(['id', 'username', 'avatar', 'feed_rand'])
        .then(rows => rows[0]);
}

function getUser(userId) {
    return knex('users')
        .select(['username', 'fullname', 'description', 'email',
            'avatar', 'banner', 'feed_rand', 'email_notify'])
        .where('id', userId)
        .andWhere({ active: true })
        .first();
}

function update(userObj, userId) {
    if (userObj.password) {
        const salt = bcrypt.genSaltSync();
        // eslint-disable-next-line
        userObj.password = bcrypt.hashSync(userObj.password, salt);
    }
    return knex('users')
        .update(userObj)
        .update('updated_at', new Date())
        .where('id', userId)
        .returning(`${Object.keys(userObj)[0]}`)
        .then(rows => rows[0]);
}

/* profiles */

function mySubscription(user, authUserId) {
    return knex('users_subscriptions')
        .select('id')
        .where({ user_id: user.id, sub_user_id: authUserId })
        .first()
        .then(id => ({ ...user, my_subscription: id ? id.id : null }));
}

function followersCount(user) {
    return knex('users_subscriptions')
        .count('*')
        .where('user_id', user.id)
        .first()
        .then(({ count }) => ({ ...user, followers_cnt: count }));
}

function followinCount(user) {
    return knex('users_subscriptions')
        .count('*')
        .where('sub_user_id', user.id)
        .first()
        .then(({ count }) => ({ ...user, followin_cnt: count }));
}

function getOne(username, authUserId) {
    return knex('users')
        .select(['id', 'username', 'fullname', 'description', 'avatar', 'banner'])
        .where({ username, active: true })
        .first()
        .then(_row => (_row ? followersCount(_row) : _row))
        .then(_row => (_row ? followinCount(_row) : _row))
        .then(_row => (_row ? mySubscription(_row, authUserId) : _row));
}

function getAllInList({ list, userId, limiter }) {
    return knex('users')
        .select('id')
        .select(limiter || ['username', 'avatar', 'fullname'])
        .select(knex.raw('left (description, 30) as description'))
        .whereIn('id', list)
        .andWhere({ active: true })
        .map(_row => (_row ? followersCount(_row) : _row))
        .map(_row => (_row && !limiter ? mySubscription(_row, userId) : _row))
        .then(profiles => ({ profiles }));
}

function getAllTrending({ userId, offset, reduced }) {
    const today = new Date();
    const period = new Date(today.getFullYear(),
        today.getMonth(), today.getDate() - OBSERVABLE_PERIOD);
    return knex('users_subscriptions')
        .select('user_id')
        .where('created_at', '>', period)
        .groupBy('user_id')
        .orderByRaw('COUNT(user_id) DESC')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map((_row) => {
            return knex('users')
                .select(['id', 'username', 'fullname', 'avatar'])
                .select(knex.raw('left (description, 30) as description'))
                .where('id', _row.user_id)
                .andWhere({ active: true })
                .first();
        })
        .map(_row => (_row ? followersCount(_row) : _row))
        .map(_row => (_row ? mySubscription(_row, userId) : _row))
        .then((profiles) => {
            return knex('users_subscriptions')
                .countDistinct('user_id')
                .where('created_at', '>', period)
                .first()
                .then(({ count }) => ({ count, profiles }));
        });
}

function getAllSearched({ query, userId, offset, reduced }) {
    return knex('users')
        .select(['id', 'username', 'fullname', 'avatar'])
        .select(knex.raw('left (description, 30) as description'))
        .whereRaw('LOWER(username) like ?', `%${query}%`)
        .orWhereRaw('LOWER(fullname) like ?', `%${query}%`)
        .andWhere({ active: true })
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => (_row ? followersCount(_row) : _row))
        .map(_row => (_row ? mySubscription(_row, userId) : _row))
        .then((profiles) => {
            return knex('users')
                .count('*')
                .whereRaw('LOWER(username) like ?', `%${query}%`)
                .orWhereRaw('LOWER(fullname) like ?', `%${query}%`)
                .andWhere({ active: true })
                .first()
                .then(({ count }) => ({ count, profiles }));
        });
}

function deleteAllInactive() {
    const today = new Date();
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3);
    knex('users')
        .del()
        .where('active', false)
        .andWhere('last_post_at', '>', threeMonthsAgo)
        .returning('id');
}


module.exports = {
    comparePass,
    isExist,
    create,
    getUser,
    update,
    getOne,
    getAllInList,
    getAllTrending,
    getAllSearched,
    deleteAllInactive
};
