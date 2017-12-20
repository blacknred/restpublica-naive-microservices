/* eslint-disable no-param-reassign */
const knex = require('./connection');
const routeHelpers = require('../routes/_helpers');

const limit = 18;
const today = new Date();
const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);

function getPostThumbs(post) {
    return knex('thumbnails')
        .select(['url', 'content_type'])
        .where('id', post.post_id) // 'post_id', post.post_id
        .then((row) => {
            post.thumbs = row;
            return post;
        });
}

function getLikesCount(post) {
    return knex('likes')
        .count()
        .where('post_id', post.post_id)
        .first()
        .then((row) => {
            post.likes_count = row.count;
            return post;
        });
}

function getCommentsCount(post) {
    return knex('comments')
        .count('*')
        .where('post_id', post.post_id)
        .first()
        .then((row) => {
            post.comments_count = row.count;
            return post;
        });
}

/* posts */

function getDashboard(subscriptionsArr, offset) {
    return knex('posts')
        .select(['id as post_id', 'user_id', 'views', 'created_at'])
        .select(knex.raw('left (description, 22) as description'))
        .whereIn('user_id', subscriptionsArr)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            if (_row) return getPostThumbs(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getLikesCount(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getCommentsCount(_row);
            return _row;
        })
        .then((rows) => {
            return knex('posts')
                .count('*')
                .whereIn('user_id', subscriptionsArr)
                .first()
                .then((count) => {
                    return Object.assign({}, { rows }, { count });
                });
        });
}

function getTrendingPosts(offset) {
    return knex('posts')
        .distinct('id as post_id')
        .select(['user_id', 'views', 'created_at'])
        .select(knex.raw('left (description, 22) as description'))
        .where('created_at', '>', lastWeek)
        .orderBy('views', 'desc')
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            if (_row) return getPostThumbs(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getLikesCount(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getCommentsCount(_row);
            return _row;
        })
        .then((rows) => {
            return knex('posts')
                .count('*')
                .where('created_at', '>', lastWeek)
                .first()
                .then((count) => {
                    return Object.assign({}, { rows }, { count });
                });
        })
        .catch(() => {
            return null;
        });
}

function getUserPosts(userId, offset) {
    return knex('posts')
        .select(['id as post_id', 'user_id', 'views', 'created_at'])
        .select(knex.raw('left (description, 22) as description'))
        .where('user_id', userId)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            if (_row) return getPostThumbs(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getLikesCount(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getCommentsCount(_row);
            return _row;
        })
        .then((rows) => {
            return knex('posts')
                .count('*')
                .where('user_id', userId)
                .first()
                .then((count) => {
                    return Object.assign({}, { posts: rows }, { count: count.count });
                });
        })
        .catch(() => {
            return null;
        });
}

function getSearchedPosts(searchPattern, offset) {
    return knex('posts')
        .select(['id as post_id', 'user_id', 'views', 'created_at'])
        .select(knex.raw('left (description, 22) as description'))
        .where('description', 'like', `%${searchPattern}%`)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset)
        .map((_row) => {
            if (_row) return getPostThumbs(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getLikesCount(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getCommentsCount(_row);
            return _row;
        })
        .then((rows) => {
            return knex('posts')
                .count('*')
                .where('description', 'like', `%${searchPattern}%`)
                .then((count) => {
                    return Object.assign({}, { rows }, { count });
                });
        })
        .catch(() => {
            return null;
        });
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
    getTrendingPosts,
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
