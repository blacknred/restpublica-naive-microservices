const knex = require('./connection');
const routeHelpers = require('../routes/_helpers');

const limit = 20;
const today = new Date();
const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);


/* posts */

function getDashboard(subscriptionsArr, offset) {
    return knex('posts')
        .whereIn('user_id', subscriptionsArr)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);
}

function getSearchedPosts(searchPattern, offset) {
    return knex('posts')
        .where('description', 'like', `%${searchPattern}%`)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);
}

function getPopularPosts(offset) {
    return knex('posts')
        .where('created_at', '>', lastWeek)
        .orderBy('views', 'desc')
        .limit(limit)
        .offset(offset);
}

function getUserPosts(userId, offset) {
    return knex('posts')
        .where('user_id', userId)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);
}

/* post */

function getPost(postId) {
    return knex('posts')
        .where('posts.id', postId);
}

function addPost(newPost) {
    return knex('posts')
        .insert({ newPost });
}

function updatePost(postId, newPost) {
    return knex('posts')
        .update(newPost)
        .where('id', postId)
        .returning('*');
}

function deletePost(postId) {
    return knex('posts').select('file', 'thumbnail').where('id', postId)
        .then((paths) => {
            return routeHelpers.removePostFiles(paths);
        })
        .then((status) => {
            if (!status) return false;
            return knex.transaction((trx) => {
                    knex('posts').transacting(trx).where('id', postId).del()
                        .then(() => {
                            return knex('comments')
                                .where('post_id', postId)
                                .del();
                        })
                        .then(() => {
                            return knex('likes')
                                .where('post_id', postId)
                                .del();
                        })
                        .then(trx.commit)
                        .catch(trx.rollback);
                    });
        });
}

/* comments */

function getPostComments(postId, offset) {
    return knex('comments')
        .select('id', 'user_id', 'comment', 'created_at')
        .where('post_id', postId)
        .limit(limit)
        .offset(offset);
}

function addPostComment(newComment) {
    console.log(newComment);
    return knex('comments')
        .insert(newComment);
}

function updatePostComment(commentId, newComment) {
    return knex('comments')
        .update('comment', newComment)
        .where('id', commentId)
        .returning('*');
}

function deletePostComment(commentId) {
    return knex('comments')
        .where('id', commentId)
        .del();
}

/* likes */

function getPostLikes(postId, offset) {
    return knex('likes')
        .select('user_id')
        .where('post_id', postId)
        .limit(limit)
        .offset(offset);
}

function addPostLike(postId, userId) {
    return knex('likes')
        .insert({
            post_id: postId,
            user_id: userId
        });
}

function deletePostLike(likeId) {
    return knex('likes')
        .where('id', likeId)
        .del();
}

module.exports = {
    getDashboard,
    getSearchedPosts,
    getPopularPosts,
    getUserPosts,
    getPost,
    addPost,
    updatePost,
    deletePost,
    getPostComments,
    addPostComment,
    updatePostComment,
    deletePostComment,
    getPostLikes,
    addPostLike,
    deletePostLike
};
