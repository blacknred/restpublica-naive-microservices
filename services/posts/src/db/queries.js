/* eslint-disable no-param-reassign */
const util = require('util');
const knex = require('./connection');

const limit = 12;
const usersPostsPerOneLimit = 6;
const today = new Date();
const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);


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

function getPostContent(post, userId) {
    switch (post.type) {
        case 'file':
            return knex('post_files')
                .select('*')
                .where('post_id', post.id)
                .then((row) => {
                    post.content = row;
                    return post;
                });
        case 'link':
            return knex('post_links')
                .select('*')
                .where('post_id', post.id)
                .then((row) => {
                    post.content = row;
                    return post;
                });
        case 'poll':
            return knex('post_polls')
                .select('*')
                .where('post_id', post.id)
                .then((poll) => {
                    post.content = poll;
                    return knex('post_polls_options')
                        .select('*')
                        .where('poll_id', poll.id);
                })
                .map((opt, i) => {
                    return knex('post_polls_voices')
                        .count('*')
                        .where('option_id', opt.id)
                        .first()
                        .then((count) => {
                            post.content.options[i] =
                                { option: opt.option, count };
                        });
                })
                .then(() => {
                    return knex('post_polls_voices')
                        .select('id')
                        .whereIn('option_id', post.options)
                        .andWhere('user_id', userId)
                        .then((id) => {
                            post.content.myVotedOptionId = id;
                            return post;
                        });
                });
        default: return null;
    }
}

/* post */

function addFiles(fileObj) {
    return knex('post_files')
        .insert(fileObj)
        .returning('*')
        .catch((err) => {
            return err;
        });
}

function addLink(linkObj) {
    return knex('post_links')
        .insert(linkObj)
        .returning('*')
        .catch((err) => {
            return err;
        });
}

function addPoll(pollObj) {
    return knex('post_polls')
        .insert(pollObj)
        .returning('*')
        .catch((err) => {
            return err;
        });
}

function addPollOption(pollOptionObj) {
    return knex('post_polls_options')
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

function getPost(slug, userId) {
    return knex('posts')
        .select('*')
        .where('slug', slug)
        .andWhere('archived', false)
        .orWhere('author_id', userId)
        .first()
        .then((_row) => {
            if (!_row) throw new Error();
            return getLikesCount(_row);
        })
        .then((_row) => {
            return getCommentsCount(_row);
        })
        .then((_row) => {
            return getPostTags(_row);
        })
        .then((_row) => {
            return getPostContent(_row, userId);
        })
        .catch((err) => {
            return err;
        });
}

function updatePost(newPost, userId) {
    return knex('posts')
        .update(newPost)
        .where('id', userId)
        .returning('*')
        .catch((err) => {
            return err;
        });
}

function deletePost(postId, userId) {
    const filesToDelete = [];
    knex.transaction((trx) => {
        knex('posts')
            .del()
            .where('id', postId)
            .andWhere('author_id', userId)
            .returning('*')
            .transacting(trx)
            .then((post) => {
                if (!post) throw new Error();
                switch (post.type) {
                    case 'file':
                        knex('post_files')
                            .del()
                            .where('post_id', postId)
                            .returning(['file', 'thumb'])
                            .transacting(trx)
                            .then((paths) => {
                                filesToDelete.push(paths);
                            });
                        break;
                    case 'link':
                        knex('post_links')
                            .del()
                            .where('post_id', postId)
                            .returning('thumb')
                            .transacting(trx)
                            .then((path) => {
                                filesToDelete.push(path);
                            });
                        break;
                    case 'poll':
                        knex('post_polls')
                            .del()
                            .where('post_id', postId)
                            .return('id')
                            .transacting(trx)
                            .then((pollId) => {
                                knex('post_polls_options')
                                    .del()
                                    .where('poll_id', pollId)
                                    .return(['id', 'img'])
                                    .transacting(trx)
                                    .map((data) => {
                                        filesToDelete.push(data.img);
                                        return knex('post_polls_voices')
                                            .del()
                                            .where('option_id', data.id)
                                            .transacting(trx);
                                    });
                            });
                        break;
                    default:
                }
            })
            .then(() => {
                return knex('comments')
                    .del()
                    .where('post_id', postId)
                    .transacting(trx);
            })
            .then(() => {
                return knex('likes')
                    .del()
                    .where('post_id', postId)
                    .transacting(trx);
            })
            .then(() => {
                return knex('posts_tags')
                    .del()
                    .where('post_id', postId)
                    .transacting(trx);
            })
            .then(trx.commit)
            .catch(trx.rollback);
    })
        .then(() => {
            return filesToDelete;
        })
        .catch((err) => {
            return err;
        });
}


/* posts */

function getTrendingPosts(offset, userId) {
    return knex('posts')
        .distinct('id')
        .select(['slug', 'author_id', 'community_id', 'type', 'views_cnt', 'created_at'])
        .select(knex.raw('left (description, 40) as description'))
        .where('created_at', '>', lastWeek)
        .andWhere('archived', false)
        .orderBy('views', 'desc')
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => {
            if (_row) return getPostContent(_row, userId);
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
        .map((_row) => {
            if (_row) return getPostTags(_row);
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

function getSearchedPosts(searchPattern, offset, userId) {
    return knex('posts')
        .select(['slug', 'author_id', 'community_id', 'type', 'views_cnt', 'created_at'])
        .select(knex.raw('left (description, 40) as description'))
        .whereRaw('LOWER(description) like ?', `%${searchPattern}%`)
        .andWhere('archived', false)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(limit * offset)
        .map((_row) => {
            if (_row) return getPostContent(_row, userId);
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

function getPostsByTag(tag, offset, userId) {
    return knex('posts')
        .select(['slug', 'author_id', 'community_id', 'type', 'views_cnt', 'created_at'])
        .select(knex.raw('left (description, 40) as description'))
        .leftJoin('posts_tags', 'posts.id', 'posts_tags.post_id')
        .leftJoin('tags', 'posts_tags.tag_id', 'tags.id')
        .where('tags.title', tag)
        .andWhere('archived', false)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(limit * offset)
        .map((_row) => {
            if (_row) return getPostContent(_row, userId);
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

function getProfilesPosts(profiles, offset, userId, concise = false) {
    return knex('posts')
        .select(['slug', 'author_id', 'community_id', 'type', 'views_cnt', 'created_at'])
        .select(knex.raw('left (description, 40) as description'))
        .whereIn('author_id', profiles)
        .andWhere('archived', profiles !== userId ? false : false || true)
        .orderBy('created_at', 'desc')
        .limit(concise ? usersPostsPerOneLimit : limit)
        .offset(limit * offset)
        .map((_row) => {
            if (_row) return getPostContent(_row, userId);
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

function getCommunitiesPosts(communities, offset, userId, concise = false) {
    return knex('posts')
        .select(['slug', 'author_id', 'community_id', 'type', 'views_cnt', 'created_at'])
        .select(knex.raw('left (description, 40) as description'))
        .whereIn('user_id', communities)
        .andWhere('archived', false)
        .orderBy('created_at', 'desc')
        .limit(concise ? usersPostsPerOneLimit : limit)
        .offset(limit * offset)
        .map((_row) => {
            if (_row) return getPostContent(_row, userId);
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

function getProfilePostsCount(userId) {
    return knex('posts')
        .count('*')
        .where('user_id', userId)
        .first()
        .then((count) => {
            return count;
        })
        .catch((err) => {
            return err;
        });
}

function getCommunityPostsCount(communityId) {
    return knex('posts')
        .count('*')
        .where('community_id', communityId)
        .first()
        .then((count) => {
            return count;
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
        .then((row) => {
            return row;
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
        .then((row) => {
            return row;
        })
        .catch((err) => {
            return err;
        });
}


module.exports = {
    addFiles,
    addLink,
    addPoll,
    addPollOption,
    saveTag,
    addTagToPost,
    createPost,
    getPost,
    getTrendingPosts,
    getSearchedPosts,
    getProfilesPosts,
    getCommunitiesPosts,
    getPostsByTag,
    getProfilePostsCount,
    getCommunityPostsCount,
    updatePost,
    deletePost,
    addPostComment,
    getPostComments,
    updatePostComment,
    deletePostComment,
    addPostLike,
    getPostLikes,
    deletePostLike,
    getTrendingTags,
    getSearchedTags,

    
};
