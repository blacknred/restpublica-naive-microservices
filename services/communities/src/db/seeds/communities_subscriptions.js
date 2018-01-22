const faker = require('faker');
const helpers = require('../_helpers');

const createSubscription = (knex, id, userId) => {
    return knex('communities_subscriptions')
        .insert({
            community_id: id,
            user_id: userId,
            created_at: faker.date.past()
        })
        .catch(err => console.log(err));
};

exports.seed = (knex, Promise) => {
    return knex('communities_subscriptions')
        .del()
        .then(() => {
            const records = [];
            for (let i = 1; i <= 10; i++) {
                const subUsersLength = Math.floor(Math.random() * 40) + 1;
                const subUsers = helpers.genUniqueNumbersArr(subUsersLength, 40);
                subUsers.forEach(userId => records.push(createSubscription(knex, i, userId)));
            }
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
