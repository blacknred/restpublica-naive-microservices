const faker = require('faker');

const createComment = (knex) => {
    return knex('comments').insert({
        post_id: Math.floor((Math.random() * 60) + 1),
        user_id: Math.floor((Math.random() * 20) + 1),
        comment: faker.lorem.sentences()
    });
};
exports.seed = (knex, Promise) => {
    return knex('comments').del()
        .then(() => {
            const records = [];
            for (let i = 1; i < 120; i++) {
                records.push(createComment(knex, i));
            }
            return Promise.all(records);
        })
        .catch((err) => {
            console.log(err);
        });
    };
