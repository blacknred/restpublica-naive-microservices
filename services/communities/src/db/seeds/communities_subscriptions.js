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
            return knex('communities')
                .count('id')
                .first();
        })
        .then((cnt) => {
            console.log(cnt.count);
            const records = [];
            if (process.env.NODE_ENV === 'test') {
                records.push(createSubscription(knex, 1, 2));
            } else {
                for (let i = 1; i <= cnt.count; i++) {
                    const subUsersLength = Math.floor(Math.random() * cnt.count) + 1;
                    const subUsers = helpers.genUniqueNumbersArr(subUsersLength, 40);
                    subUsers.forEach(userId => records.push(createSubscription(knex, i, userId)));
                }
            }
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
