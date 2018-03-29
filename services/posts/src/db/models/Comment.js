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


function getAll(postId, offset, reduced) {
    return knex('comments')
        .select('*')
        .where('post_id', postId)
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
        .returning('*');
}

function update(newComment, commentId, userId) {
    return knex('comments')
        .update(newComment)
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
