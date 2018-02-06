const faker = require('faker');
const helpers = require('../_helpers');

const createSubscription = (knex, id, subId) => {
    return knex('users_subscriptions')
        .insert({
            user_id: id,
            sub_user_id: subId,
            created_at: faker.date.past()
        })
        .catch(err => console.log(err));
};

exports.seed = (knex, Promise) => {
    return knex('users_subscriptions')
        .del()
        .then(() => {
            const records = [];
            for (let i = 1; i < 35; i++) {
                const subUsersLength = Math.floor(Math.random() * 40) + 1;
                const subUsers = helpers.genUniqueNumbersArr(subUsersLength, 40);
                subUsers.forEach(userId => records.push(createSubscription(knex, i, userId)));
            }
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
