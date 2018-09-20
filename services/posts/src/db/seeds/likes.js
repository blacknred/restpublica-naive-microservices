const helpers = require('../_helpers');

const ISTEST = process.env.NODE_ENV === 'ISTEST';
const POSTS_CNT = 500;
const USERS_CNT = 40;

const createLike = (knex, id, userId) => {
    return knex('likes')
        .insert({
            post_id: id,
            user_id: userId
        })
        .catch(err => console.log(err));
};

exports.seed = (knex, Promise) => {
    return knex('likes')
        .del()
        .then(() => {
            const records = [];
            for (let i = 1; i <= (ISTEST ? 10 : POSTS_CNT); i++) {
                const usersLength = Math.floor(Math.random() * (ISTEST ? 3 : USERS_CNT)) + 1;
                const users = helpers.genUniqueNumbersArr(usersLength, (ISTEST ? 3 : USERS_CNT));
                users.forEach(userId => records.push(createLike(knex, i, userId)));
            }
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
