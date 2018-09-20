/* eslint-disable no-case-declarations */

const knex = require('./../connection');

const LIMIT = 12;
const MOBILE_LIMIT = 6;
const OBSERVABLE_PERIOD = 60;

/* posts */

function isExists(postId) {
    return knex('posts')
        .select(['author_id', 'commentable', 'archived'])
        .where({ id: postId })
        .first();
}

function getMyLike(post, userId) {
    return knex('likes')
        .select('id')
        .where('post_id', post.id)
        .andWhere('user_id', userId)
        .first()
        .then(id => ({ ...post, my_like_id: id ? id.id : null }));
}

function getLikesCount(post) {
    return knex('likes')
        .count()
        .where('post_id', post.id)
        .first()
        .then(({ count }) => ({ ...post, likes_cnt: count }));
}

function getRepostsCount(post) {
    return knex('reposts')
        .count('*')
        .where('post_id', post.id)
        .first()
        .then(({ count }) => ({ ...post, reposts_cnt: count }));
}

function getCommentsCount(post) {
    return knex('comments')
        .count('*')
        .where('post_id', post.id)
        .first()
        .then(({ count }) => ({ ...post, comments_cnt: count }));
}

function getLastComments(post) {
    return knex('comments')
        .select('*')
        .where('post_id', post.id)
        .orderBy('created_at', 'desc')
        .limit(3)
        .map((row) => {
            return knex('comments_likes')
                .count('*')
                .where('comment_id', row.id)
                .first()
                .then(({ count }) => ({ ...row, likes_cnt: count }));
        })
        .then(comments => ({ ...post, comments }));
}

function getContent(post, userId) {
    switch (post.type) {
        case 'file':
            return knex('files')
                .select('*')
                .where('post_id', post.id)
                .then(content => ({ ...post, content }));
        case 'link':
            return knex('links')
                .select('*')
                .where('post_id', post.id)
                .then(content => ({ ...post, content }));
        case 'repost':
            return knex('posts')
                .select(['id', 'slug', 'author_id', 'description', 'type'])
                .where('id', post.id)
                .first()
                .then(content => ({ ...post, content }))
                .then(filledPost => getContent(filledPost.content, userId));
        case 'poll':
            const content = [];
            return knex('polls_options')
                .select('*')
                .where('post_id', post.id)
                .map((opt, i) => {
                    return knex('polls_voices')
                        .count('*')
                        .where('option_id', opt.id)
                        .first()
                        .then(({ count }) => {
                            return knex('polls_voices')
                                .select('id')
                                .where('option_id', opt.id)
                                .andWhere('user_id', userId)
                                .first()
                                .then((id) => {
                                    content[i] = {
                                        ...opt, count, my_vote: id ? id.id : null
                                    };
                                });
                        });
                })
                .then(() => ({ ...post, content }));
        default: return post;
    }
}

/* */


function addFiles(fileObj) {
    return knex('files')
        .insert(fileObj)
        .returning('*');
}

function addLink(linkObj) {
    return knex('links')
        .insert(linkObj)
        .returning('*');
}

function addPollOption(pollOptionObj) {
    return knex('polls_options')
        .insert(pollOptionObj)
        .returning('*');
}

function addRepost(repostObj) {
    return knex('reposts')
        .insert(repostObj)
        .returning('*');
}

function getAllCountByProfile(profileId, userId) {
    return knex('posts')
        .count('*')
        .where('author_id', profileId)
        .andWhere({ archived: profileId === userId ? true || false : false })
        .first();
        // .then(({ count }) => ({ count }));
}

function getAllCountByCommunity(communityId) {
    return knex('posts')
        .count('*')
        .where('community_id', communityId)
        .andWhere('archived', false);
        // .then(({ count }) => ({ count }));
}

function create(newPost) {
    return knex('posts')
        .insert(newPost)
        .returning('*');
}

function getOne(slug, userId) {
    return knex('posts')
        .select('*')
        .where({ slug, archived: false })
        .orWhere({ slug, author_id: userId })
        .first()
        .then(_row => (_row ? getLikesCount(_row) : _row))
        .then(_row => (_row ? getRepostsCount(_row) : _row))
        .then(_row => (_row ? getCommentsCount(_row) : _row))
        .then(_row => (_row ? getContent(_row, userId) : _row))
        .then(_row => (_row ? getMyLike(_row, userId) : _row));
}

function update({ updatedValue, postId, userId }) {
    return knex('posts')
        .update(updatedValue)
        .update('updated_at', knex.fn.now())
        .where('id', postId)
        .andWhere('author_id', userId)
        .returning(`${Object.keys(updatedValue)[0]}`)
        .then(rows => rows[0]);
}

function deleteOne(postId, userId) {
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
                                return knex('files')
                                    .del()
                                    .where('post_id', postId)
                                    .transacting(trx)
                                    .returning(['file', 'thumb'])
                                    .then((paths) => { filesToDelete = Object.values(paths[0]); });
                            case 'link':
                                return knex('links')
                                    .del()
                                    .where('post_id', postId)
                                    .transacting(trx);
                            case 'repost':
                                return knex('reposts')
                                    .del()
                                    .where('post_id', postId)
                                    .transacting(trx);
                            case 'poll':
                                return knex('polls_options')
                                    .select('id')
                                    .where('post_id', postId)
                                    .map((opt) => {
                                        return knex('polls_voices')
                                            .del()
                                            .where('option_id', opt.id)
                                            .transacting(trx);
                                    })
                                    .then(() => {
                                        return knex('polls_options')
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


function getAllTrending({ userId, offset, reduced }) {
    const today = new Date();
    const period = new Date(today.getFullYear(),
        today.getMonth(), today.getDate() - OBSERVABLE_PERIOD);
    return knex('posts')
        .select('*')
        .select(knex.raw('left (description, 80) as description'))
        .where('created_at', '>', period)
        .andWhere('archived', false)
        .andWhere('type', '!=', 'poll')
        .andWhere('type', '!=', 'repost')
        .orderBy('views_cnt', 'desc')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => (_row ? getLikesCount(_row) : _row))
        .map(_row => (_row ? getRepostsCount(_row) : _row))
        .map(_row => (_row ? getCommentsCount(_row) : _row))
        .map(_row => (_row ? getContent(_row, userId) : _row))
        .map(_row => (_row ? getMyLike(_row, userId) : _row))
        .map(_row => (_row ? getLastComments(_row) : _row))
        .then((posts) => {
            return knex('posts')
                .count('*')
                .where('created_at', '>', period)
                .andWhere('archived', false)
                .first()
                .then(({ count }) => ({ count, posts }));
        });
}

function getAllSearched({ query, userId, offset, reduced }) {
    return knex('posts')
        .select('*')
        .whereRaw('LOWER(description) like ?', `%${query}%`)
        .andWhere('archived', false)
        .orderBy('created_at', 'desc')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => (_row ? getLikesCount(_row) : _row))
        .map(_row => (_row ? getRepostsCount(_row) : _row))
        .map(_row => (_row ? getCommentsCount(_row) : _row))
        .map(_row => (_row ? getContent(_row, userId) : _row))
        .map(_row => (_row ? getMyLike(_row, userId) : _row))
        .map(_row => (_row ? getLastComments(_row) : _row))
        .then((posts) => {
            return knex('posts')
                .count('*')
                .whereRaw('LOWER(description) like ?', `%${query}%`)
                .andWhere('archived', false)
                .first()
                .then(({ count }) => ({ count, posts }));
        });
}

function getAllByTag({ tag, userId, offset, reduced }) {
    return knex('posts')
        .select('posts.*')
        .leftJoin('posts_tags', 'posts.id', 'posts_tags.post_id')
        .leftJoin('tags', 'posts_tags.tag_id', 'tags.id')
        .where('tags.title', tag)
        .andWhere('posts.archived', false)
        .orderBy('posts.created_at', 'desc')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => (_row ? getLikesCount(_row) : _row))
        .map(_row => (_row ? getRepostsCount(_row) : _row))
        .map(_row => (_row ? getCommentsCount(_row) : _row))
        .map(_row => (_row ? getContent(_row, userId) : _row))
        .map(_row => (_row ? getMyLike(_row, userId) : _row))
        .map(_row => (_row ? getLastComments(_row) : _row))
        .then((posts) => {
            return knex('posts')
                .count('posts.id')
                .leftJoin('posts_tags', 'posts.id', 'posts_tags.post_id')
                .leftJoin('tags', 'posts_tags.tag_id', 'tags.id')
                .where('tags.title', tag)
                .andWhere('posts.archived', false)
                .first()
                .then(({ count }) => ({ count, posts }));
        });
}

function getAllFeed({ profiles, communities, userId, offset, reduced }) {
    return knex('posts')
        .select('*')
        .whereIn('author_id', profiles)
        .andWhere('archived', false)
        .orWhereIn('community_id', communities)
        .andWhere('archived', false)
        .orderBy('created_at', 'desc')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => (_row ? getLikesCount(_row) : _row))
        .map(_row => (_row ? getRepostsCount(_row) : _row))
        .map(_row => (_row ? getCommentsCount(_row) : _row))
        .map(_row => (_row ? getContent(_row, userId) : _row))
        .map(_row => (_row ? getMyLike(_row, userId) : _row))
        .map(_row => (_row ? getLastComments(_row) : _row))
        .then((posts) => {
            return knex('posts')
                .count('*')
                .whereIn('author_id', profiles)
                .andWhere('archived', false)
                .orWhereIn('community_id', communities)
                .andWhere('archived', false)
                .first()
                .then(({ count }) => ({ count, posts }));
        });
}

function getAllByProfile({ profileId, userId, offset, reduced }) {
    return knex('posts')
        .select('posts.*')
        .where('author_id', profileId)
        .orderBy('created_at', 'desc')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT / 2 : LIMIT / 2))
        .modify((queryBuilder) => {
            if (parseInt(profileId, 10) !== userId) {
                queryBuilder.andWhere('archived', false);
            }
        })
        .map(_row => (_row ? getLikesCount(_row) : _row))
        .map(_row => (_row ? getRepostsCount(_row) : _row))
        .map(_row => (_row ? getCommentsCount(_row) : _row))
        .map(_row => (_row ? getContent(_row, userId) : _row))
        .map(_row => (_row ? getMyLike(_row, userId) : _row))
        .map(_row => (_row ? getLastComments(_row) : _row))
        .then((posts) => {
            return knex('posts')
                .count('*')
                .where('author_id', profileId)
                .modify((queryBuilder) => {
                    if (parseInt(profileId, 10) !== userId) {
                        queryBuilder.andWhere('archived', false);
                    }
                })
                .first()
                .then(({ count }) => ({ count, posts }));
        });
}

function getAllByCommunity({ communityId, userId, offset, reduced }) {
    return knex('posts')
        .select('posts.*')
        .where('community_id', communityId)
        .andWhere('archived', false)
        .orderBy('created_at', 'desc')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => (_row ? getLikesCount(_row) : _row))
        .map(_row => (_row ? getRepostsCount(_row) : _row))
        .map(_row => (_row ? getCommentsCount(_row) : _row))
        .map(_row => (_row ? getContent(_row, userId) : _row))
        .map(_row => (_row ? getMyLike(_row, userId) : _row))
        .map(_row => (_row ? getLastComments(_row) : _row))
        .then((posts) => {
            return knex('posts')
                .count('*')
                .where('community_id', communityId)
                .andWhere('archived', false)
                .first()
                .then(({ count }) => ({ count, posts }));
        });
}

module.exports = {
    isExists,
    addFiles,
    addLink,
    addPollOption,
    addRepost,
    create,
    getOne,
    update,
    deleteOne,
    getAllTrending,
    getAllSearched,
    getAllByProfile,
    getAllByCommunity,
    getAllFeed,
    getAllCountByProfile,
    getAllCountByCommunity,
    getAllByTag
};
