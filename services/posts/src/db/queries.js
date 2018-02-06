/* eslint-disable no-param-reassign */
const util = require('util');
const knex = require('./connection');
const routeHelpers = require('../routes/_helpers');

const limit = 12;
const usersPostsPerOneLimit = 6;
const today = new Date();
const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);


function getPostThumbs(post) {
    return knex('thumbnails')
        .select(['url', 'content_type'])
        .where('post_id', post.post_id) // 'post_id', post.post_id
        .then((row) => {
            post.thumbs = row;
            return post;
        });
}

function getPostTags(post) {
    return knex('tags')
        .select('title')
        .leftJoin('posts_tags', 'tags.id', 'posts_tags.tag_id')
        .where('posts_tags.post_id', post.post_id)
        .then((row) => {
            post.tags = row;
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

/* post */

function addFiles(fileObj) {
    return knex('files')
        .insert(fileObj)
        .returning('*')
        .catch((err) => {
            return err;
        });
}

function addLink(linkObj) {
    return knex('links')
        .insert(linkObj)
        .returning('*')
        .catch((err) => {
            return err;
        });
}

function addPoll(pollObj) {
    return knex('polls')
        .insert(pollObj)
        .returning('*')
        .catch((err) => {
            return err;
        });
}

function addPollOption(pollOptionObj) {
    return knex('polls_options')
        .insert(pollOptionObj)
        .returning('*')
        .catch((err) => {
            return err;
        });
}



function saveTag(tag) {
    return knex('tags')
        .insert('title', tag)
        .returning('id')
        .catch((err) => {
            return err;
        });
}

function addTagToPost(tagId, postId) {
    return knex('posts')
        .insert({ tag_id: tagId, post_id: postId })
        .returning('*')
        .catch((err) => {
            return err;
        });
}

function createPost(newPost) {
    return knex('posts')
        .insert({ newPost })
        .returning('*')
        .catch((err) => {
            return err;
        });
}

function getPost(slug) {
    return knex('posts')
        .select('*')
        .where('slug', slug)
        .then((_row) => {
            return getLikesCount(_row[0]);
        })
        .then((_row) => {
            return getCommentsCount(_row);
        })
        .then((_row) => {
            return getPostTags(_row);
        })
        .then((_row) => {
            switch
            return knex('files')
                .select(['url', 'content_type'])
                .where('post_id', _row.post_id)
                .then((row) => {
                    _row.files = row;
                    return _row;
                });
        })
        .catch((err) => {
            return err;
        });
}







function updatePost(postId, newPost) {
    return knex('posts')
        .update(newPost)
        .where('id', postId)
        .returning('*')
        .catch((err) => {
            return err;
        });
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





/* posts */



function getUserPostsCount(userId) {
    return knex('posts')
        .count('*')
        .where('user_id', userId)
        .first()
        .then((count) => {
            return count.count;
        })
        .catch((err) => {
            return err;
        });
}


/* comments */

function getPostComments(postId, offset) {
    return knex('comments')
        .select('*')
        .where('post_id', postId)
        .limit(limit)
        .offset(limit * offset)
        .then((rows) => {
            return knex('comments')
                .count('*')
                .where('post_id', postId)
                .first()
                .then((count) => {
                    return Object.assign(
                        {}, { count: count.count },
                        { comments: rows }
                    );
                });
        })
        .catch((err) => {
            return err;
        });
}

function addPostComment(newComment) {
    return knex('comments')
        .insert(newComment)
        .returning('*')
        .then((row) => {
            return row[0];
        })
        .catch((err) => {
            return err;
        });
}

function updatePostComment(commentId, userId, newComment) {
    return knex('comments')
        .update(newComment)
        .where('id', commentId)
        .andWhere('user_id', userId)
        .returning('*')
        .then((data) => {
            console.log(data);
            return data.length ? data[0] :
                new Error('No found comment or access is restricted');
        })
        .catch((err) => {
            return err;
        });
}

function deletePostComment(commentId, userId) {
    return knex('comments')
        .del()
        .where('id', commentId)
        .andWhere('user_id', userId)
        .then((data) => {
            return data === 1 ? commentId :
                new Error('No found comment or access is restricted');
        })
        .catch((err) => {
            return err;
        });
}

/* likes */

function getPostLikes(postId, offset) {
    return knex('likes')
        .select('*')
        .where('post_id', postId)
        .limit(limit)
        .offset(limit * offset)
        .then((rows) => {
            return knex('likes')
                .count('*')
                .where('post_id', postId)
                .first()
                .then((count) => {
                    return Object.assign(
                        {}, { count: count.count },
                        { likes: rows }
                    );
                });
        })
        .catch((err) => {
            return err;
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
    return knex.raw(query)
        .then((data) => {
            return data.rows[0].id;
        })
        .catch((err) => {
            return err;
        });
}

function deletePostLike(likeId, userId) {
    return knex('likes')
        .del()
        .where('id', likeId)
        .andWhere('user_id', userId)
        .then((data) => {
            return data === 1 ? likeId :
                new Error('No found like or access is restricted');
        })
        .catch((err) => {
            return err;
        });
}







// ///////////////////////////////////////////////////////////////


/* tags */

function getTrendingTags(offset) {
    return knex('posts_tags')
        .select('tags.id')
        .where('created_at', '>', lastWeek)
        .groupBy('tags.id')
        .orderByRaw('COUNT(tags.id) DESC')
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            return knex('tags')
                .select('title')
                .where('id', _row.tag_id)
                .first();
        })
        .map((_row) => {
            if (_row) return getPostThumbs(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getPostTags(_row);
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
            return knex('posts_tags')
                .count('*')
                .where('created_at', '>', lastWeek)
                .first()
                .then((count) => {
                    return Object.assign(
                        {}, { count: count.count },
                        { tags: rows }
                    );
                });
        })
        .catch((err) => {
            return err;
        });
}

function getSearchedTags(searchPattern, offset) {
    return knex('tags')
        .select('title')
        .leftJoin('posts_tags', 'tags.id', 'posts_tags.tag_id')
        .whereRaw('LOWER(title) like ?', `%${searchPattern}%`)
        .orderBy('posts_tags.created_at', 'desc')
        .limit(limit)
        .offset(limit * offset)
        .map((_row) => {
            if (_row) return getPostThumbs(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getPostTags(_row);
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
            return knex('tags')
                .count('*')
                .whereRaw('LOWER(title) like ?', `%${searchPattern}%`)
                .first()
                .then((count) => {
                    return Object.assign(
                        {}, { count: count.count },
                        { tags: rows }
                    );
                });
        })
        .catch((err) => {
            return err;
        });
}

/* posts */

function getTrendingPosts(offset) {
    return knex('posts')
        .distinct('id')
        .select(['slug', 'user_id', 'views', 'created_at'])
        .select(knex.raw('left (description, 40) as description'))
        .where('created_at', '>', lastWeek)
        .orderBy('views', 'desc')
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            if (_row) return getPostThumbs(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getPostTags(_row);
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
                    return Object.assign(
                        {}, { count: count.count },
                        { posts: rows }
                    );
                });
        })
        .catch((err) => {
            return err;
        });
}

function getSearchedPosts(searchPattern, offset) {
    return knex('posts')
        .select(['id', 'slug', 'user_id', 'views', 'created_at'])
        .select(knex.raw('left (description, 40) as description'))
        .whereRaw('LOWER(description) like ?', `%${searchPattern}%`)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(limit * offset)
        .map((_row) => {
            if (_row) return getPostThumbs(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getPostTags(_row);
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
                .whereRaw('LOWER(description) like ?', `%${searchPattern}%`)
                .first()
                .then((count) => {
                    return Object.assign(
                        {}, { count: count.count },
                        { posts: rows }
                    );
                });
        })
        .catch((err) => {
            return err;
        });
}

function getPostsByTag(tag, offset) {
    return knex('posts')
        .select(['id', 'slug', 'user_id', 'views', 'created_at'])
        .select(knex.raw('left (description, 40) as description'))
        .leftJoin('posts_tags', 'posts.id', 'posts_tags.post_id')
        .leftJoin('tags', 'posts_tags.tag_id', 'tags.id')
        .where('tags.title', tag)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(limit * offset)
        .map((_row) => {
            if (_row) return getPostThumbs(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getPostTags(_row);
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
                .leftJoin('posts_tags', 'posts.id', 'posts_tags.post_id')
                .leftJoin('tags', 'posts_tags.tag_id', 'tags.id')
                .where('tags.title', tag)
                .first()
                .then((count) => {
                    return Object.assign(
                        {}, { count: count.count },
                        { posts: rows }
                    );
                });
        })
        .catch((err) => {
            return err;
        });
}

function getProfilesPosts(userId, profiles, offset, concise = false) {
    return knex('posts')
        .select(['id', 'slug', 'user_id', 'community_id', 'views_cnt', 'created_at'])
        .select(knex.raw('left (description, 40) as description'))
        .whereIn('user_id', profiles)
        .andWhere('archived', profiles !== userId ? false : false || true)
        .orderBy('created_at', 'desc')
        .limit(concise ? usersPostsPerOneLimit : limit)
        .offset(limit * offset)
        .map((_row) => {
            if (_row) return getPostThumbs(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getPostTags(_row);
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
                .andWhere('archived', profiles !== userId ? false : false || true)
                .first()
                .then((count) => {
                    return Object.assign(
                        {}, { count: count.count },
                        { posts: rows }
                    );
                });
        })
        .catch((err) => {
            return err;
        });
}

function getCommunitiesPosts(userId, communities, offset, concise = false) {
    return knex('posts')
        .select(['id', 'slug', 'user_id', 'community_id', 'views_cnt', 'created_at'])
        .select(knex.raw('left (description, 40) as description'))
        .whereIn('user_id', communities)
        .andWhere('archived', false)
        .orderBy('created_at', 'desc')
        .limit(concise ? usersPostsPerOneLimit : limit)
        .offset(limit * offset)
        .map((_row) => {
            if (_row) return getPostThumbs(_row);
            return _row;
        })
        .map((_row) => {
            if (_row) return getPostTags(_row);
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
                .whereIn('user_id', communities)
                .first()
                .then((count) => {
                    return Object.assign(
                        {}, { user_id: userId, count: count.count },
                        { posts: rows }
                    );
                });
        })
        .catch((err) => {
            return err;
        });
}


module.exports = {
    addFiles,
    addLink,
    saveTag,
    addTagToPost,
    createPost,


    getUserPosts,
    getUserPostsCount,
    getDashboardPosts,
    getPostComments,
    addPostComment,
    updatePostComment,
    deletePostComment,
    getPostLikes,
    addPostLike,
    deletePostLike,

    getPost,
    addPost,
    updatePost,
    deletePost,


    getTrendingTags,
    getSearchedTags,
    getProfilesPosts,
    getCommunitiesPosts,
    getTrendingPosts,
    getSearchedPosts,
    getPostsByTag,

};
