const helpers = require('../_helpers');

const test = process.env.NODE_ENV === 'test';

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
            for (let i = 1; i <= (test ? 10 : 500); i++) {
                const usersLength = Math.floor(Math.random() * (test ? 3 : 40)) + 1;
                const users = helpers.genUniqueNumbersArr(usersLength, (test ? 3 : 40));
                users.forEach(userId => records.push(createLike(knex, i, userId)));
            }
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
