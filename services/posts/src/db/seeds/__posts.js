const faker = require('faker');

const createPost = (knex) => {
    return knex('posts')
        .insert({
            user_id: Math.floor((Math.random() * 30) + 1),
            description: faker.lorem.sentences(),
            views: Math.floor((Math.random() * 100) + 1),
            created_at: faker.date.past()
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.seed = (knex, Promise) => {
    return knex('posts').del()
        .then(() => {
            const records = [];
            for (let i = 1; i <= 500; i++) {
                records.push(createPost(knex));
            }
            return Promise.all(records);
        })
        .catch((err) => {
            console.log(err);
        });
};
