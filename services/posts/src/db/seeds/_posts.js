const faker = require('faker');
const helpers = require('../_helpers');

const createPost = (knex, i) => {
    const post = {
        user_id: Math.floor(Math.random() * 40) + 1,
        slug: helpers.genSlug(),
        description: faker.lorem.sentences(),
        views_cnt: Math.floor(Math.random() * 500) + 1,
        created_at: faker.date.past()
    };
    if (i % 5 === 0) post.community_id = Math.floor(Math.random() * 10) + 1;
    return knex('posts')
        .insert(post)
        .catch(err => console.log(err));
};

exports.seed = (knex, Promise) => {
    return knex('posts')
        .del()
        .then(() => {
            const records = [];
            for (let i = 0; i < 500; i++) {
                records.push(createPost(knex, i));
            }
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
