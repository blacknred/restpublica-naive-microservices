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
        .then((comments) => {
            return knex('comments')
                .count('*')
                .where('post_id', postId)
                .first()
                .then(({ count }) => { return { count, comments }; });
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

module.exports = {
    isExists,
    create,
    getAll,
    update,
    deleteOne
};
