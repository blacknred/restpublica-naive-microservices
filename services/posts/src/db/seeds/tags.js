const helpers = require('../_helpers');

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
            for (let i = 1; i <= 30; i++) {
                const postsLength = Math.floor(Math.random() * 30) + 1;
                const posts = helpers.genUniqueNumbersArr(postsLength, 500);
                posts.forEach(postId => records.push(createTagMapping(knex, i, postId)));
            }
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
