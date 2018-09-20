/* eslint-disable no-param-reassign */

const util = require('util');
const knex = require('./../connection');

const LIMIT = 12;
const MOBILE_LIMIT = 6;

/* comments */

function isExists(commentId) {
    return knex('comments')
        .select('user_id', 'post_id')
        .where('id', commentId)
        .first();
}

function getAll({ postId, offset, reduced }) {
    return knex('comments')
        .select('*')
        .where('post_id', postId)
        .orderBy('created_at', 'desc')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map((row) => {
            return knex('comments_likes')
                .count('*')
                .where('comment_id', row.id)
                .first()
                .then(({ count }) => { row.likes_cnt = count; });
        })
        .then((data) => {
            return knex('comments')
                .count('*')
                .where('post_id', postId)
                .first()
                .then(({ count }) => { return { count, data }; });
        });
}

function create(newComment) {
    return knex('comments')
        .insert(newComment)
        .returning('*')
        .then(rows => rows[0]);
}

function update({ newComment, commentId, userId }) {
    return knex('comments')
        .update(newComment)
        .update('updated_at', knex.fn.now())
        .where('id', commentId)
        .andWhere('user_id', userId)
        .returning('*');
}

function deleteOne(commentId, userId) {
    return knex('comments')
        .del()
        .where('id', commentId)
        .andWhere('user_id', userId);
}

/* */

function createLike(newLike) {
    // upsert
    const insert = knex('comments_likes').insert(newLike);
    const updates = knex('comments_likes').update(newLike);
    const query = util.format(
        '%s ON CONFLICT (comment_id, user_id) DO UPDATE SET %s RETURNING id',
        insert.toString(),
        updates.toString().replace(/^update\s.*\sset\s/i, '')
    );
    return knex.raw(query).then(({ rows }) => { return { id: rows[0].id }; });
}

function deleteLike(commentId, userId) {
    return knex('comments_likes')
        .del()
        .where({ comment_id: commentId, user_id: userId })
        .then(() => { return { id: commentId }; });
}

module.exports = {
    isExists,
    create,
    getAll,
    update,
    deleteOne,

    createLike,
    deleteLike
};
