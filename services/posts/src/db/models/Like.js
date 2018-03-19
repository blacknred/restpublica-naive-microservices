const util = require('util');
const knex = require('./../connection');

const LIMIT = 12;

/* likes */

function getPostLikes(postId, offset) {
    return knex('likes')
        .select('user_id')
        .where('post_id', postId)
        .limit(LIMIT)
        .offset(LIMIT * offset)
        .then((rows) => {
            return knex('likes')
                .count('*')
                .where('post_id', postId)
                .first()
                .then((count) => { return { count: count.count, likes: rows }; });
        });
}

function addPostLike(newLike) {
    // upsert
    const insert = knex('likes').insert(newLike);
    const update = knex('likes').update(newLike);
    const query = util.format(
        '%s ON CONFLICT (post_id, user_id) DO UPDATE SET %s RETURNING id',
        insert.toString(),
        update.toString().replace(/^update\s.*\sset\s/i, '')
    );
    return knex.raw(query).then(data => data.rows[0]);
}

function deletePostLike(postId, userId) {
    return knex('likes')
        .del()
        .where('post_id', postId)
        .andWhere('user_id', userId);
}

module.exports = {
    addPostLike,
    getPostLikes,
    deletePostLike
};
