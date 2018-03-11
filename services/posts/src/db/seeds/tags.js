const helpers = require('../_helpers');

const test = process.env.NODE_ENV === 'test';

const createTagMapping = (knex, id, postId) => {
    return knex('posts_tags')
        .insert({
            tag_id: id,
            post_id: postId
        })
        .catch(err => console.log(err));
};

exports.seed = (knex, Promise) => {
    return knex('posts_tags')
        .del()
        .then(() => {
            const records = [];
            for (let i = 1; i <= (test ? 3 : 30); i++) {
                const postsCount = Math.floor(Math.random() * (test ? 1 : 30)) + 1;
                const posts = helpers.genUniqueNumbersArr(postsCount, (test ? 10 : 500));
                posts.forEach(postId => records.push(createTagMapping(knex, i, postId)));
            }
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
