/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
const util = require('util');
const bcrypt = require('bcryptjs');
const knex = require('../db/connection');
const localAuth = require('../auth/local');

const limit = 12;
const today = new Date();
const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 20);


/* auth */

function checkUser(userId) {
    return knex('users')
        .where({ id: userId }).first()
        .then((user) => {
            return user.id;
        })
        .catch((err) => {
            return err;
        });
}

function comparePass(userPassword, databasePassword) {
    return bcrypt.compareSync(userPassword, databasePassword);
}

/* user */

function findUserByName(username) {
    return knex('users')
        .select(['id', 'password', 'avatar'])
        .where('username', username)
        .first();
}

function findUserByEmail(email) {
    return knex('users')
        .select('id')
        .where('email', email)
        .first();
}

function createUser(newUser) {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(newUser.password, salt);
    newUser.password = hash;
    return knex('users')
        .insert(newUser)
        .returning(['id', 'username', 'avatar'])
        .catch((err) => {
            return err;
        });
}

function updateUser(userObj, userId) {
    return knex('users')
        .update(userObj)
        .where('id', userId)
        .returning(`${Object.keys(userObj)[0]}`)
        .catch((err) => {
            return err;
        });
}

function deleteUser(userId) {
    return knex('users')
        .del()
        .where('id', userId)
        .then((data) => {
            return data;
        })
        .catch((err) => {
            return err;
        });
}

function getUserData(userId) {
    return knex('users')
        .select(['username', 'fullname', 'description', 'email', 'avatar'])
        .where('id', userId)
        .first()
        .catch((err) => {
            return err;
        });
}

/* profile */

function getMySubscriptionFromProfileFollowers(user, authUserId) {
    return knex('users_subscriptions')
        .select('id')
        .where({ user_id: user.id, sub_user_id: authUserId })
        .first()
        .then((row) => {
            user.my_subscription_id = row ? row.id : null;
            return user;
        });
}

function getProfileFollowersCount(user) {
    return knex('users_subscriptions')
        .count('*')
        .where('user_id', user.id)
        .first()
        .then((row) => {
            user.followers_count = row.count;
            return user;
        });
}

function getProfileFollowingCount(user) {
    return knex('users_subscriptions')
        .count('*')
        .where('sub_user_id', user.id)
        .first()
        .then((row) => {
            user.following_count = row.count;
            return user;
        });
}

function getProfileData(userName, authUserId) {
    return knex('users')
        .select(['id', 'username', 'fullname', 'description', 'avatar'])
        .where('username', userName)
        .first()
        .then((_row) => {
            return getProfileFollowersCount(_row);
        })
        .then((_row) => {
            return getProfileFollowingCount(_row);
        })
        .then((_row) => {
            return getMySubscriptionFromProfileFollowers(_row, authUserId);
        })
        .then((row) => {
            return row;
        })
        .catch((err) => {
            return err;
        });
}

/* profiles */

function getProfilesData(usersIdArr) {
    return knex('users')
        .select(['id', 'username', 'avatar'])
        .whereIn('id', usersIdArr)
        .then((rows) => {
            return rows;
        })
        .catch((err) => {
            return err;
        });
}

function getTrendingProfiles(offset, authUserId) {
    return knex('users_subscriptions')
        .select('user_id')
        .where('created_at', '>', lastWeek)
        .groupBy('user_id')
        .orderByRaw('COUNT(user_id) DESC')
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            return knex('users')
                .select(['id', 'username', 'fullname', 'avatar'])
                .where('id', _row.user_id)
                .first();
        })
        .map((_row) => {
            if (_row) return getProfileFollowersCount(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getMySubscriptionFromProfileFollowers(_row, authUserId);
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
                        { users: rows }
                    );
                });
        })
        .catch((err) => {
            return err;
        });
}

function getSearchedProfiles(searchPattern, offset, authUserId) {
    return knex('users')
        .select(['id', 'username', 'fullname', 'avatar'])
        .whereRaw('LOWER(username) like ?', `%${searchPattern}%`)
        .orWhereRaw('LOWER(fullname) like ?', `%${searchPattern}%`)
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            if (_row) return getProfileFollowersCount(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getMySubscriptionFromProfileFollowers(_row, authUserId);
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


/* subscriptions */

function getFollowers(userId, offset, authUserId) {
    return knex('users_subscriptions')
        .select(['subscriptions.id as subscription_id', 'sub_user_id as user_id',
            'username', 'fullname', 'avatar'])
        .rightJoin('users', 'users.id', 'subscriptions.sub_user_id')
        .where('user_id', userId)
        .andWhere('sub_user_id', '!=', authUserId)
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            if (_row) return getMySubscriptionFromProfileFollowers(_row, authUserId);
            return _row;
        })
        .then((rows) => {
            return knex('users_subscriptions')
                .count('*')
                .where('user_id', userId)
                .andWhere('sub_user_id', '!=', authUserId)
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
            if (_row) return getMySubscriptionFromProfileFollowers(_row, authUserId);
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

function getFollowingIds(userId, offset) {
    return knex('users_subscriptions')
        .select('user_id')
        .where('sub_user_id', userId)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset * limit)
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
    comparePass,
    findUserByName,
    findUserByEmail,
    createUser,
    getUserData,
    getProfilesData,
    getTrendingProfiles,
    getSearchedProfiles,
    getProfileData,
    updateUser,
    getFollowers,
    getFollowing,
    getFollowingIds,
    createSubscription,
    deleteSubscription
};
