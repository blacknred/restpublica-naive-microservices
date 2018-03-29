const util = require('util');
const knex = require('./../connection');

const LIMIT = 12;
const MOBILE_LIMIT = 6;

/* likes */

function getAll(postId, offset, reduced) {
    return knex('likes')
        .select('user_id')
        .where('post_id', postId)
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .then((likes) => {
            return knex('likes')
                .count('*')
                .where('post_id', postId)
                .first()
                .then(({ count }) => { return { count, likes }; });
        });
}

function create(newLike) {
    // upsert
    const insert = knex('likes').insert(newLike);
    const update = knex('likes').update(newLike);
    const query = util.format(
        '%s ON CONFLICT (post_id, user_id) DO UPDATE SET %s RETURNING id',
        insert.toString(),
        update.toString().replace(/^update\s.*\sset\s/i, '')
    );
    return knex.raw(query).then(({ rows }) => rows[0].id);
}

function deleteOne(postId, userId) {
    return knex('likes')
        .del()
        .where({ post_id: postId, user_id: userId });
}

module.exports = {
    create,
    getAll,
    deleteOne
};
