const faker = require('faker');
const helpers = require('../_helpers');

const test = process.env.NODE_ENV === 'test';

const createPost = (knex, i) => {
    const post = {
        slug: helpers.genSlug(),
        author_id: Math.floor(Math.random() * (test ? 3 : 40)) + 1,
        description: faker.lorem.sentences(),
        type: 'file',
        views_cnt: Math.floor(Math.random() * (test ? 30 : 500)) + 1,
        created_at: faker.date.past()
    };
    if (i % 3 === 0) {
        post.community_id = Math.floor(Math.random() * (test ? 2 : 10)) + 1;
    }
    return knex('posts')
        .insert(post)
        .catch(err => console.log(err));
};

exports.seed = (knex, Promise) => {
    return knex('posts')
        .del()
        .then(() => {
            const records = [];
            for (let i = 0; i < (test ? 10 : 500); i++) {
                records.push(createPost(knex, i));
            }
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
