/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable no-confusing-arrow */

const bcrypt = require('bcryptjs');
const knex = require('../../db/connection');

const LIMIT = 12;
const MOBILE_LIMIT = 6;

function comparePass(userPassword, databasePassword) {
    return bcrypt.compareSync(userPassword, databasePassword);
}

/* user */

function isExist(obj) {
    return knex('users')
        .select(['id', 'password', 'avatar'])
        .where(obj)
        .first();
}

function isAdmin(userId) {
    return knex('users')
        .where({ id: userId })
        .andWhere({ admin: true })
        .first()
        .then(admin => admin ? true : false); // eslint-disable-line
}

function create(newUser) {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(newUser.password, salt);
    newUser.password = hash;
    return knex('users')
        .returning(['id', 'username', 'avatar'])
        .insert(newUser)
        .then(data => data[0]);
}

function update(userObj, userId) {
    return knex('users')
        .update(userObj)
        .where('id', userId)
        .returning(`${Object.keys(userObj)[0]}`)
        .then(data => data[0]);
}

function getPrivate(userId) {
    return knex('users')
        .select(['username', 'fullname', 'description', 'email', 'avatar'])
        .where('id', userId)
        .andWhere({ active: true })
        .first();
}


/* profiles */

function mySubscription(user, authUserId) {
    return knex('users_subscriptions')
        .select('id')
        .where({ user_id: user.id, sub_user_id: authUserId })
        .first()
        .then((row) => {
            user.my_subscription_id = row ? row.id : null;
            return user;
        });
}

function followersCount(user) {
    return knex('users_subscriptions')
        .count('*')
        .where('user_id', user.id)
        .first()
        .then((row) => {
            user.followers_count = row.count;
            return user;
        });
}

function followingCount(user) {
    return knex('users_subscriptions')
        .count('*')
        .where('sub_user_id', user.id)
        .first()
        .then((row) => {
            user.following_count = row.count;
            return user;
        });
}

function getOne(username, authUserId, lim) {
    return knex('users')
        .select(lim || '*')
        .where({ username })
        .andWhere({ active: true })
        .first()
        .then(_row => _row && !lim ? followersCount(_row) : _row)
        .then(_row => _row && !lim ? followingCount(_row) : _row)
        .then(_row => _row && !lim ? mySubscription(_row, authUserId) : _row);
}

function getAllInList(arr, authUserId) {
    return knex('users')
        .select(['id', 'username', 'fullname', 'avatar'])
        .whereIn('id', arr)
        .andWhere({ active: true });
}

function getAllTrending(authUserId, offset, reduced) {
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(),
        today.getMonth(), today.getDate() - 14);
    return knex('users_subscriptions')
        .select('user_id')
        .where('created_at', '>', lastWeek)
        .groupBy('user_id')
        .orderByRaw('COUNT(user_id) DESC')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * reduced ? MOBILE_LIMIT : LIMIT)
        .map((_row) => {
            return knex('users')
                .select(['id', 'username', 'fullname', 'avatar'])
                .where('id', _row.user_id)
                .andWhere({ active: true })
                .first();
        })
        .map(_row => _row ? followersCount(_row) : _row)
        .map(_row => _row ? mySubscription(_row, authUserId) : _row)
        .then((rows) => {
            return knex('users_subscriptions')
                .countDistinct('user_id')
                .where('created_at', '>', lastWeek)
                .first()
                .then((count) => {
                    return { count: count.count, users: rows };
                });
        });
}

function getAllSearched(pattern, authUserId, offset, reduced) {
    return knex('users')
        .select(['id', 'username', 'fullname', 'avatar'])
        .whereRaw('LOWER(username) like ?', `%${pattern}%`)
        .orWhereRaw('LOWER(fullname) like ?', `%${pattern}%`)
        .andWhere({ active: true })
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * reduced ? MOBILE_LIMIT : LIMIT)
        .map(_row => _row ? followersCount(_row) : _row)
        .map(_row => _row ? mySubscription(_row, authUserId) : _row)
        .then((rows) => {
            return knex('users')
                .count('*')
                .whereRaw('LOWER(username) like ?', `%${pattern}%`)
                .orWhereRaw('LOWER(fullname) like ?', `%${pattern}%`)
                .andWhere({ active: true })
                .first()
                .then((count) => {
                    return { count: count.count, users: rows };
                });
        });
}

function deleteAllInactive() {
    const today = new Date();
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3);
    knex('users')
        .del()
        .where('active', false)
        .andWhere('activity_at', '>', threeMonthsAgo)
        .returning('id');
}


module.exports = {
    comparePass,
    isExist,
    isAdmin,
    create,
    getPrivate,
    update,
    getOne,
    getAllInList,
    getAllTrending,
    getAllSearched,
    deleteAllInactive
};
