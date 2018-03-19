/* eslint-disable no-param-reassign */
/* eslint-disable no-confusing-arrow */
/* eslint-disable no-return-assign */

const util = require('util');
const knex = require('./../connection');

const LIMIT = 12;

/* posts */

function findPostById(id) {
    return knex('posts')
        .select('author_id')
        .where({ id })
        .first();
}

function getPostTags(post) {
    return knex('tags')
        .select('title')
        .leftJoin('posts_tags', 'tags.id', 'posts_tags.tag_id')
        .where('posts_tags.post_id', post.id)
        .then((row) => {
            post.tags = row.map(tag => tag.title);
            return post;
        });
}

function getLikesCount(post) {
    return knex('likes')
        .count()
        .where('post_id', post.id)
        .first()
        .then((row) => {
            post.likes_count = row.count;
            return post;
        });
}

function getMyLike(post, userId) {
    return knex('likes')
        .select('id')
        .where('post_id', post.id)
        .andWhere('user_id', userId)
        .first()
        .then((row) => {
            post.myLike = row ? row.id : null;
            return post;
        });
}

function getCommentsCount(post) {
    return knex('comments')
        .count('*')
        .where('post_id', post.id)
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
                .first()
                .then((row) => {
                    post.content = row;
                    return post;
                });
        case 'link':
            return knex('post_links')
                .select('*')
                .where('post_id', post.id)
                .first()
                .then((row) => {
                    post.content = row;
                    return post;
                });
        case 'poll':
            return knex('post_polls')
                .select('*')
                .where('post_id', post.id)
                .first()
                .then((poll) => {
                    post.content = Object.assign(poll,
                        { options: [], myVotedOptionId: null });
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
                            opt.votes_count = count.count;
                            post.content.options[i] = opt;
                        });
                })
                .then(() => {
                    const ids = Object.values(post.content.options.map(opt => opt.id));
                    return knex('post_polls_voices')
                        .select('id')
                        .whereIn('option_id', ids)
                        .andWhere('user_id', userId)
                        .first()
                        .then((id) => {
                            post.content.myVotedOptionId = id ? id.id : null;
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
    const insert = knex('posts_tags').insert({ tag_id: tagId, post_id: postId });
    const update = knex('posts_tags').update({ tag_id: tagId, post_id: postId });
    const query = util.format(
        '%s ON CONFLICT (tag_id, post_id) DO UPDATE SET %s RETURNING id',
        insert.toString(),
        update.toString().replace(/^update\s.*\sset\s/i, '')
    );
    return knex.raw(query).then(data => data.rows[0].id);
}

function removeTagsFromPost(postId) {
    return knex('posts_tags')
        .del()
        .where('post_id', postId);
}

function createPost(newPost) {
    return knex('posts')
        .insert(newPost)
        .returning('*');
}

function getPost(slug, userId) {
    return knex('posts')
        .select('*')
        .where({ slug, archived: false })
        .orWhere({ slug, author_id: userId })
        .first()
        .then(_row => _row ? getLikesCount(_row) : _row)
        .then(_row => _row ? getCommentsCount(_row) : _row)
        .then(_row => _row ? getPostContent(_row, userId) : _row)
        .then(_row => _row ? getPostTags(_row) : _row)
        .then(_row => _row ? getMyLike(_row, userId) : _row);
}

function getTrendingPosts(userId, offset) {
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
    return knex('posts')
        .distinct('id')
        .select('*')
        .select(knex.raw('left (description, 40) as description'))
        .where('created_at', '>', lastWeek)
        .andWhere('archived', false)
        .orderBy('views_cnt', 'desc')
        .limit(LIMIT)
        .offset(offset * LIMIT)
        .map(_row => _row ? getLikesCount(_row) : _row)
        .map(_row => _row ? getCommentsCount(_row) : _row)
        .map(_row => _row ? getPostContent(_row, userId) : _row)
        .map(_row => _row ? getPostTags(_row) : _row)
        .map(_row => _row ? getMyLike(_row, userId) : _row)
        .then((rows) => {
            return knex('posts')
                .count('*')
                .where('created_at', '>', lastWeek)
                .first()
                .then((count) => { return { count: count.count, posts: rows }; });
        });
}

function getSearchedPosts(pattern, userId, offset) {
    return knex('posts')
        .select('*')
        .select(knex.raw('left (description, 40) as description'))
        .whereRaw('LOWER(description) like ?', `%${pattern}%`)
        .andWhere('archived', false)
        .orderBy('created_at', 'desc')
        .limit(LIMIT)
        .offset(LIMIT * offset)
        .map(_row => _row ? getLikesCount(_row) : _row)
        .map(_row => _row ? getCommentsCount(_row) : _row)
        .map(_row => _row ? getPostContent(_row, userId) : _row)
        .map(_row => _row ? getPostTags(_row) : _row)
        .map(_row => _row ? getMyLike(_row, userId) : _row)
        .then((rows) => {
            return knex('posts')
                .count('*')
                .whereRaw('LOWER(description) like ?', `%${pattern}%`)
                .first()
                .then((count) => { return { count: count.count, posts: rows }; });
        });
}

function getPostsByTag(tag, userId, lim, offset) {
    return knex('posts')
        .select('posts.*')
        .select(knex.raw('left (description, 40) as description'))
        .leftJoin('posts_tags', 'posts.id', 'posts_tags.post_id')
        .leftJoin('tags', 'posts_tags.tag_id', 'tags.id')
        .where('tags.title', tag)
        .andWhere('posts.archived', false)
        .orderBy('posts.created_at', 'desc')
        .limit(LIMIT)
        .offset(LIMIT * offset)
        .map(_row => _row ? getLikesCount(_row) : _row)
        .map(_row => _row ? getCommentsCount(_row) : _row)
        .map(_row => _row ? getPostContent(_row, userId) : _row)
        .map(_row => _row ? getPostTags(_row) : _row)
        .map(_row => _row ? getMyLike(_row, userId) : _row)
        .then((rows) => {
            return knex('posts')
                .count('posts.id')
                .leftJoin('posts_tags', 'posts.id', 'posts_tags.post_id')
                .leftJoin('tags', 'posts_tags.tag_id', 'tags.id')
                .where('tags.title', tag)
                .andWhere('posts.archived', false)
                .first()
                .then((count) => { return { count: count.count, posts: rows }; });
        });
}

function getProfilesPosts(profiles, userId, offset, limit) {
    const userProfile = profiles.length === 1 && profiles[0] === userId.toString();
    return knex('posts')
        .select(['posts.*', knex.raw('left (description, 40) as description')])
        .whereIn('author_id', profiles)
        .whereIn('archived', userProfile ? [true, false] : [false])
        .orderBy('created_at', 'desc')
        .limit(limit || LIMIT)
        .offset(LIMIT * offset)
        .map(_row => _row ? getLikesCount(_row) : _row)
        .map(_row => _row ? getCommentsCount(_row) : _row)
        .map(_row => _row ? getPostContent(_row, userId) : _row)
        .map(_row => _row ? getPostTags(_row) : _row)
        .map(_row => _row ? getMyLike(_row, userId) : _row)
        .then((rows) => {
            return knex('posts')
                .count('*')
                .whereIn('author_id', profiles)
                .whereIn('archived', userProfile ? [true, false] : [false])
                .first()
                .then((cnt) => { return { count: cnt.count, posts: rows }; });
        });
}

function getCommunitiesPosts(communities, userId, offset, limit) {
    return knex('posts')
        .select(['posts.*', knex.raw('left (description, 40) as description')])
        .whereIn('user_id', communities)
        .andWhere('archived', false)
        .orderBy('created_at', 'desc')
        .limit(limit || LIMIT)
        .offset(LIMIT * offset)
        .map(_row => _row ? getLikesCount(_row) : _row)
        .map(_row => _row ? getCommentsCount(_row) : _row)
        .map(_row => _row ? getPostContent(_row, userId) : _row)
        .map(_row => _row ? getPostTags(_row) : _row)
        .map(_row => _row ? getMyLike(_row, userId) : _row)
        .then((rows) => {
            return knex('posts')
                .count('*')
                .whereIn('user_id', communities)
                .andWhere('archived', false)
                .first()
                .then((count) => { return { count: count.count, posts: rows }; });
        });
}

function getProfilesPostsCount(profiles, userId) {
    const userProfile = profiles.length === 1 && profiles[0] === userId.toString();
    return knex('posts')
        .count('*')
        .whereIn('author_id', profiles)
        .whereIn('archived', userProfile ? [true, false] : [false])
        .first();
}

function getCommunitiesPostsCount(communities) {
    return knex('posts')
        .count('*')
        .whereIn('user_id', communities)
        .andWhere('archived', false)
        .first();
}

function updatePost(updatedPost, postId, userId) {
    return knex('posts')
        .update(updatedPost)
        .where('id', postId)
        .andWhere('author_id', userId)
        .returning('*');
}

function deletePost(postId, userId) {
    let filesToDelete;
    return knex.transaction((trx) => {
        return knex('comments')
            .del()
            .where('post_id', postId)
            .transacting(trx)
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
            .then(() => {
                return knex('posts')
                    .select('type')
                    .where('id', postId)
                    .andWhere('author_id', userId)
                    .first()
                    .then((post) => {
                        switch (post.type) {
                            case 'file':
                                return knex('post_files')
                                    .del()
                                    .where('post_id', postId)
                                    .transacting(trx)
                                    .returning(['file', 'thumb'])
                                    .then(paths => filesToDelete = Object.values(paths[0]));
                            case 'link':
                                return knex('post_links')
                                    .del()
                                    .where('post_id', postId)
                                    .transacting(trx);
                            case 'poll':
                                return knex('post_polls')
                                    .select('id')
                                    .where('post_id', postId)
                                    .map((poll) => {
                                        return knex('post_polls_options')
                                            .select('id')
                                            .where('poll_id', poll.id)
                                            .map((opt) => {
                                                return knex('post_polls_voices')
                                                    .del()
                                                    .where('option_id', opt.id)
                                                    .transacting(trx);
                                            })
                                            .then(() => {
                                                return knex('post_polls_options')
                                                    .del()
                                                    .where('poll_id', poll.id)
                                                    .transacting(trx);
                                            });
                                    })
                                    .then(() => {
                                        return knex('post_polls')
                                            .del()
                                            .where('post_id', postId)
                                            .transacting(trx);
                                    });
                            default: return null;
                        }
                    });
            })
            .then(() => {
                return knex('posts')
                    .del()
                    .where('id', postId)
                    .transacting(trx);
            })
            .then(trx.commit)
            .catch(trx.rollback);
    })
        .then(() => filesToDelete);
}

module.exports = {
    findPostById,
    addFiles,
    addLink,
    addPoll,
    addPollOption,
    saveTag,
    addTagToPost,
    removeTagsFromPost,
    createPost,
    getPost,
    updatePost,
    deletePost,
    getTrendingPosts,
    getSearchedPosts,
    getProfilesPosts,
    getCommunitiesPosts,
    getProfilesPostsCount,
    getCommunitiesPostsCount,
    getPostsByTag
};
