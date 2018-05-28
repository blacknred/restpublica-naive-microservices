const faker = require('faker');

const test = process.env.NODE_ENV === 'test';

const createComment = (knex) => {
    return knex('comments')
        .insert({
            post_id: Math.floor(Math.random() * (test ? 10 : 500)) + 1,
            user_id: Math.floor(Math.random() * (test ? 3 : 40)) + 1,
            body: faker.lorem.sentences(),
            created_at: faker.date.past()
        })
        .catch(err => console.log(err));
};
exports.seed = (knex, Promise) => {
    return knex('comments')
        .del()
        .then(() => {
            const records = [];
            for (let i = 1; i < (test ? 100 : 5000); i++) {
                records.push(createComment(knex, i));
            }
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
