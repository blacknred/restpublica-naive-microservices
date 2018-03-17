/* eslint-disable no-param-reassign */
const util = require('util');
const knex = require('./connection');

const limit = 12;
const usersPostsPerOneLimit = 6;
const today = new Date();
const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);


/* posts */

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

function addFiles(fileObj) {
    return knex('post_files')
        .insert(fileObj)
        .returning('*');
}

function addLink(linkObj) {
    return knex('post_links')
        .insert(linkObj)
        .returning('*');
}

function addPoll(pollObj) {
    return knex('post_polls')
        .insert(pollObj)
        .returning('*');
}

function addPollOption(pollOptionObj) {
    return knex('post_polls_options')
        .insert(pollOptionObj)
        .returning('*');
}

function saveTag(tag) {
    // upsert
    const insert = knex('tags').insert({ title: tag });
    const update = knex('tags').update({ title: tag });
    const query = util.format(
        '%s ON CONFLICT (title) DO UPDATE SET %s RETURNING id',
        insert.toString(),
        update.toString().replace(/^update\s.*\sset\s/i, '')
    );
    return knex.raw(query).then(data => data.rows[0].id);
}

function addTagToPost(tagId, postId) {
    // upsert
    const insert = knex('post_tags').insert({ tag_id: tagId, post_id: postId });
    const update = knex('post_tags').update({ tag_id: tagId, post_id: postId });
    const query = util.format(
        '%s ON CONFLICT (tag_id, post_id) DO UPDATE SET %s RETURNING id',
        insert.toString(),
        update.toString().replace(/^update\s.*\sset\s/i, '')
    );
    return knex.raw(query).then(data => data.rows[0].id);
}

function createPost(newPost) {
    return knex('posts')
        .insert(newPost)
        .returning('*');
}

function getPost(slug, userId) {
    return knex('posts')
        .select('*')
        .where({ slug })
        .andWhere('archived', false)
        .orWhere('author_id', userId)
        .first()
        .then((_row) => {
            if (!_row) throw new Error('Post not exist');
            return getLikesCount(_row);
        })
        .then(_row => getCommentsCount(_row))
        .then(_row => getPostTags(_row))
        .then(_row => getPostContent(_row, userId));
}

function getTrendingPosts(userId, lim, offset) {
    return knex('posts')
        .distinct('id')
        .select(lim || ['slug', 'author_id', 'community_id', 'type', 'views_cnt', 'created_at'])
        .select(knex.raw('left (description, 40) as description'))
        .where('created_at', '>', lastWeek)
        .andWhere('archived', false)
        .orderBy('views', 'desc')
        .limit(limit)
        .offset(offset * limit)
        .map((_row) => { return _row && !lim ? getPostContent(_row, userId) : _row; })
        .map((_row) => { return _row && !lim ? getLikesCount(_row) : _row; })
        .map((_row) => { return _row && !lim ? getCommentsCount(_row) : _row; })
        .map((_row) => { return _row && !lim ? getPostTags(_row) : _row; })
        .then((rows) => {
            if (lim) return rows;
            return knex('posts')
                .count('*')
                .where('created_at', '>', lastWeek)
                .first()
                .then((count) => { return { count: count.count, posts: rows }; });
        });
}

function getSearchedPosts(pattern, userId, lim, offset) {
    return knex('posts')
        .select(lim || ['slug', 'author_id', 'community_id', 'type', 'views_cnt', 'created_at'])
        .select(knex.raw('left (description, 40) as description'))
        .whereRaw('LOWER(description) like ?', `%${pattern}%`)
        .andWhere('archived', false)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(limit * offset)
        .map((_row) => { return _row && !lim ? getPostContent(_row, userId) : _row; })
        .map((_row) => { return _row && !lim ? getLikesCount(_row) : _row; })
        .map((_row) => { return _row && !lim ? getCommentsCount(_row) : _row; })
        .map((_row) => { return _row && !lim ? getPostTags(_row) : _row; })
        .then((rows) => {
            if (lim) return rows;
            return knex('posts')
                .count('*')
                .whereRaw('LOWER(description) like ?', `%${pattern}%`)
                .first()
                .then((count) => { return { count: count.count, posts: rows }; });
        });
}

function getPostsByTag(tag, userId, lim, offset) {
    return knex('posts')
        .select(lim || ['slug', 'author_id', 'community_id', 'type', 'views_cnt', 'created_at'])
        .select(knex.raw('left (description, 40) as description'))
        .leftJoin('posts_tags', 'posts.id', 'posts_tags.post_id')
        .leftJoin('tags', 'posts_tags.tag_id', 'tags.id')
        .where('tags.title', tag)
        .andWhere('archived', false)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(limit * offset)
        .map((_row) => { return _row && !lim ? getPostContent(_row, userId) : _row; })
        .map((_row) => { return _row && !lim ? getLikesCount(_row) : _row; })
        .map((_row) => { return _row && !lim ? getCommentsCount(_row) : _row; })
        .map((_row) => { return _row && !lim ? getPostTags(_row) : _row; })
        .then((rows) => {
            if (lim) return rows;
            return knex('posts')
                .count('*')
                .leftJoin('posts_tags', 'posts.id', 'posts_tags.post_id')
                .leftJoin('tags', 'posts_tags.tag_id', 'tags.id')
                .where('tags.title', tag)
                .first()
                .then((count) => { return { count: count.count, posts: rows }; });
        });
}

function getProfilesPosts(profiles, userId, lim, offset, concise = false) {
    return knex('posts')
        .select(lim || ['slug', 'author_id', 'community_id', 'type', 'views_cnt', 'created_at'])
        .select(knex.raw('left (description, 40) as description'))
        .whereIn('author_id', profiles)
        .andWhere('archived', profiles !== userId ? false : false || true)
        .orderBy('created_at', 'desc')
        .limit(concise ? usersPostsPerOneLimit : limit)
        .offset(limit * offset)
        .map((_row) => { return _row && !lim ? getPostContent(_row, userId) : _row; })
        .map((_row) => { return _row && !lim ? getLikesCount(_row) : _row; })
        .map((_row) => { return _row && !lim ? getCommentsCount(_row) : _row; })
        .map((_row) => { return _row && !lim ? getPostTags(_row) : _row; })
        .then((rows) => {
            if (lim) return rows;
            return knex('posts')
                .count('*')
                .where('user_id', userId)
                .andWhere('archived', profiles !== userId ? false : false || true)
                .first()
                .then((count) => { return { count: count.count, posts: rows }; });
        });
}

function getCommunitiesPosts(communities, userId, lim, offset, concise = false) {
    return knex('posts')
        .select(lim || ['slug', 'author_id', 'community_id', 'type', 'views_cnt', 'created_at'])
        .select(knex.raw('left (description, 40) as description'))
        .whereIn('user_id', communities)
        .andWhere('archived', false)
        .orderBy('created_at', 'desc')
        .limit(concise ? usersPostsPerOneLimit : limit)
        .offset(limit * offset)
        .map((_row) => { return _row && !lim ? getPostContent(_row, userId) : _row; })
        .map((_row) => { return _row && !lim ? getLikesCount(_row) : _row; })
        .map((_row) => { return _row && !lim ? getCommentsCount(_row) : _row; })
        .map((_row) => { return _row && !lim ? getPostTags(_row) : _row; })
        .then((rows) => {
            if (lim) return rows;
            return knex('posts')
                .count('*')
                .whereIn('user_id', communities)
                .first()
                .then((count) => { return { count: count.count, posts: rows }; });
        });
}

function updatePost(newPost, userId) {
    return knex('posts')
        .update(newPost)
        .where('id', userId)
        .returning('*');
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
                            .then(paths => filesToDelete.push(paths));
                        break;
                    case 'link':
                        knex('post_links')
                            .del()
                            .where('post_id', postId)
                            .returning('thumb')
                            .transacting(trx)
                            .then(path => filesToDelete.push(path));
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
                .then((count) => { return { count: count.count, comments: rows }; });
        });
}

function addPostComment(newComment) {
    return knex('comments')
        .insert(newComment)
        .returning('*')
        .first();
}

function updatePostComment(commentId, userId, newComment) {
    return knex('comments')
        .update(newComment)
        .where('id', commentId)
        .andWhere('user_id', userId)
        .returning('*')
        .then((data) => {
            return data.length ? data[0] :
                new Error('No found comment or access is restricted');
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
    return knex.raw(query)
        .then(data => data.rows[0].id);
}

function deletePostLike(likeId, userId) {
    return knex('likes')
        .del()
        .where('id', likeId)
        .andWhere('user_id', userId)
        .then((data) => {
            return data === 1 ? likeId :
                new Error('No found like or access is restricted');
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
        });
}

function getSearchedTags(pattern, offset) {
    return knex('tags')
        .select('title')
        .leftJoin('posts_tags', 'tags.id', 'posts_tags.tag_id')
        .whereRaw('LOWER(title) like ?', `%${pattern}%`)
        .orderBy('posts_tags.created_at', 'desc')
        .limit(limit)
        .offset(limit * offset);
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
