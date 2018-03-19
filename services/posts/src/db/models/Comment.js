const knex = require('./../connection');

const LIMIT = 12;

/* comments */

function findCommentById(commentId) {
    return knex('comments')
        .select('user_id', 'post_id')
        .where('id', commentId)
        .first();
}

function isPostCommentable(commentId) {
    return knex('posts')
        .select('commentable')
        .leftJoin('posts', 'posts.id', 'comments.post_id')
        .where('comments.id', commentId)
        .first()
        .then(res => res.commentable);
}


function getPostComments(postId, offset) {
    return knex('comments')
        .select('*')
        .where('post_id', postId)
        .limit(LIMIT)
        .offset(LIMIT * offset)
        .then((rows) => {
            return knex('comments')
                .count('*')
                .where('post_id', postId)
                .first()
                .then((count) => { return { count: count.count, comments: rows }; });
        });
}

function addPostComment(newComment) {
    return knex('comments')
        .insert(newComment)
        .returning('*');
}

function updatePostComment(newComment, commentId, userId) {
    return knex('comments')
        .update(newComment)
        .where('id', commentId)
        .andWhere('user_id', userId)
        .returning('*');
}

function deletePostComment(commentId, userId) {
    return knex('comments')
        .del()
        .where('id', commentId)
        .andWhere('user_id', userId);
}

module.exports = {
    findCommentById,
    isPostCommentable,
    addPostComment,
    getPostComments,
    updatePostComment,
    deletePostComment
};
