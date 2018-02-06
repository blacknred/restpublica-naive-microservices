const faker = require('faker');

const createComment = (knex) => {
    return knex('comments')
        .insert({
            post_id: Math.floor(Math.random() * 500) + 1,
            user_id: Math.floor(Math.random() * 40) + 1,
            body: faker.lorem.sentences()
        })
        .catch(err => console.log(err));
};
exports.seed = (knex, Promise) => {
    return knex('comments')
        .del()
        .then(() => {
            const records = [];
            for (let i = 1; i < 5000; i++) {
                records.push(createComment(knex, i));
            }
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
