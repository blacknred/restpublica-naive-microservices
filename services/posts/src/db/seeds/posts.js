const faker = require('faker');

const createPost = (knex) => {
    return knex('posts')
        .insert({
            user_id: Math.floor((Math.random() * 20) + 1),
            description: faker.lorem.sentences()
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.seed = (knex, Promise) => {
    return knex('posts').del()
        .then(() => {
            const records = [];
            for (let i = 1; i < 100; i++) {
                records.push(createPost(knex));
            }
            return Promise.all(records);
        })
        .catch((err) => {
            console.log(err);
        });
};
