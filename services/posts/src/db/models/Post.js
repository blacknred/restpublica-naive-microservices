/* eslint-disable no-param-reassign */
/* eslint-disable no-confusing-arrow */
/* eslint-disable no-return-assign */

const knex = require('./../connection');

const LIMIT = 12;
const MOBILE_LIMIT = 6;

/* posts */

function isExists(postId) {
    return knex('posts')
        .select(['author_id', 'commentable', 'archived'])
        .where({ id: postId })
        .first();
}

function getTags(post) {
    return knex('tags')
        .select('title')
        .leftJoin('posts_tags', 'tags.id', 'posts_tags.tag_id')
        .where('posts_tags.post_id', post.id)
        .then((rows) => { return { ...post, tags: rows.map(tag => tag.title) }; });
}

function getMyLike(post, userId) {
    return knex('likes')
        .select('id')
        .where('post_id', post.id)
        .andWhere('user_id', userId)
        .first()
        .then((id) => { return { ...post, my_like_id: id ? id.id : null }; });
}

function getLikesCount(post) {
    return knex('likes')
        .count()
        .where('post_id', post.id)
        .first()
        .then(({ count }) => { return { ...post, likes_cnt: count }; });
}

function getCommentsCount(post) {
    return knex('comments')
        .count('*')
        .where('post_id', post.id)
        .first()
        .then(({ count }) => { return { ...post, comments_cnt: count }; });
}

function getContent(post, userId) {
    switch (post.type) {
        case 'file':
            return knex('post_files')
                .select('*')
                .where('post_id', post.id)
                .then((content) => { return { ...post, content }; });
        case 'link':
            return knex('post_links')
                .select('*')
                .where('post_id', post.id)
                .first()
                .then((content) => { return { ...post, content }; });
        case 'poll':
            return knex('post_polls')
                .select('*')
                .where('post_id', post.id)
                .first()
                .then((poll) => {
                    post.content = { ...poll, options: [], myVotedOptionId: null };
                    return knex('post_polls_options')
                        .select('*')
                        .where('poll_id', poll.id);
                })
                .map((opt, i) => {
                    return knex('post_polls_voices')
                        .count('*')
                        .where('option_id', opt.id)
                        .first()
                        .then(({ count }) => {
                            opt.votes_cnt = count;
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
        .then(_row => _row ? getLikesCount(_row) : _row)
        .then(_row => _row ? getCommentsCount(_row) : _row)
        .then(_row => _row ? getContent(_row, userId) : _row)
        .then(_row => _row ? getTags(_row) : _row)
        .then(_row => _row ? getMyLike(_row, userId) : _row);
}

function update({ updatedPost, postId, userId }) {
    return knex('posts')
        .update(updatedPost)
        .update('updated_at', knex.fn.now())
        .where('id', postId)
        .andWhere('author_id', userId)
        .returning('*');
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


function getAllTrending({ userId, offset, reduced }) {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(),
        today.getMonth(), today.getDate() - 31);
    return knex('posts')
        .select('*')
        .select(knex.raw('left (description, 40) as description'))
        .where('created_at', '>', lastMonth)
        .andWhere('archived', false)
        .orderBy('views_cnt', 'desc')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => _row ? getLikesCount(_row) : _row)
        .map(_row => _row ? getCommentsCount(_row) : _row)
        .map(_row => _row ? getContent(_row, userId) : _row)
        .map(_row => _row ? getTags(_row) : _row)
        .map(_row => _row ? getMyLike(_row, userId) : _row)
        .then((posts) => {
            return knex('posts')
                .count('*')
                .where('created_at', '>', lastMonth)
                .andWhere('archived', false)
                .first()
                .then(({ count }) => { return { count, posts }; });
        });
}

function getAllSearched({ query, userId, offset, reduced }) {
    return knex('posts')
        .select('*')
        .select(knex.raw('left (description, 40) as description'))
        .whereRaw('LOWER(description) like ?', `%${query}%`)
        .andWhere('archived', false)
        .orderBy('created_at', 'desc')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => _row ? getLikesCount(_row) : _row)
        .map(_row => _row ? getCommentsCount(_row) : _row)
        .map(_row => _row ? getContent(_row, userId) : _row)
        .map(_row => _row ? getTags(_row) : _row)
        .map(_row => _row ? getMyLike(_row, userId) : _row)
        .then((posts) => {
            return knex('posts')
                .count('*')
                .whereRaw('LOWER(description) like ?', `%${query}%`)
                .first()
                .then(({ count }) => { return { count, posts }; });
        });
}

function getAllByTag({ tag, userId, offset, reduced }) {
    return knex('posts')
        .select('posts.*')
        .select(knex.raw('left (description, 40) as description'))
        .leftJoin('posts_tags', 'posts.id', 'posts_tags.post_id')
        .leftJoin('tags', 'posts_tags.tag_id', 'tags.id')
        .where('tags.title', tag)
        .andWhere('posts.archived', false)
        .orderBy('posts.created_at', 'desc')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => _row ? getLikesCount(_row) : _row)
        .map(_row => _row ? getCommentsCount(_row) : _row)
        .map(_row => _row ? getContent(_row, userId) : _row)
        .map(_row => _row ? getTags(_row) : _row)
        .map(_row => _row ? getMyLike(_row, userId) : _row)
        .then((posts) => {
            return knex('posts')
                .count('posts.id')
                .leftJoin('posts_tags', 'posts.id', 'posts8_tags.post_id')
                .leftJoin('tags', 'posts_tags.tag_id', 'tags.id')
                .where('tags.title', tag)
                .andWhere('posts.archived', false)
                .first()
                .then(({ count }) => { return { count, posts }; });
        });
}

function getAllDashboard({ profiles, communities, userId, offset, reduced }) {
    return knex('posts')
        .select('*')
        .whereIn('author_id', profiles)
        .orWhereIn('community_id', communities)
        .andWhere('archived', false)
        .orderBy('created_at', 'desc')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => _row ? getLikesCount(_row) : _row)
        .map(_row => _row ? getCommentsCount(_row) : _row)
        .map(_row => _row ? getContent(_row, userId) : _row)
        .map(_row => _row ? getTags(_row) : _row)
        .map(_row => _row ? getMyLike(_row, userId) : _row)
        .then((posts) => {
            return knex('posts')
                .count('*')
                .whereIn('author_id', profiles)
                .orWhereIn('community_id', communities)
                .andWhere('archived', false)
                .first()
                .then(({ count }) => { return { count, posts }; });
        });
}

function getAllByProfile({ profileId, userId, offset, reduced }) {
    return knex('posts')
        .select(['posts.*', knex.raw('left (description, 40) as description')])
        .where('author_id', profileId)
        .andWhere({ archived: profileId === userId ? true || false : false })
        .orderBy('created_at', 'desc')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT / 2 : LIMIT / 2))
        .map(_row => _row ? getLikesCount(_row) : _row)
        .map(_row => _row ? getCommentsCount(_row) : _row)
        .map(_row => _row ? getContent(_row, userId) : _row)
        .map(_row => _row ? getTags(_row) : _row)
        .map(_row => _row ? getMyLike(_row, userId) : _row)
        .then((posts) => {
            return knex('posts')
                .count('*')
                .where('author_id', profileId)
                .andWhere({ archived: profileId === userId ? true || false : false })
                .first()
                .then(({ count }) => { return { count, posts }; });
        });
}

function getAllByCommunity({ communityId, userId, offset, reduced }) {
    return knex('posts')
        .select(['posts.*', knex.raw('left (description, 40) as description')])
        .where('community_id', communityId)
        .andWhere('archived', false)
        .orderBy('created_at', 'desc')
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .map(_row => _row ? getLikesCount(_row) : _row)
        .map(_row => _row ? getCommentsCount(_row) : _row)
        .map(_row => _row ? getContent(_row, userId) : _row)
        .map(_row => _row ? getTags(_row) : _row)
        .map(_row => _row ? getMyLike(_row, userId) : _row)
        .then((posts) => {
            return knex('posts')
                .count('*')
                .where('community_id', communityId)
                .andWhere('archived', false)
                .first()
                .then(({ count }) => { return { count, posts }; });
        });
}


function getAllCountByProfile(profileId, userId) {
    return knex('posts')
        .count('*')
        .where('author_id', profileId)
        .andWhere({ archived: profileId === userId ? true || false : false })
        .first()
        .then(({ count }) => { return { count }; });
}

function getAllCountByCommunity(communityId) {
    return knex('posts')
        .count('*')
        .where('community_id', communityId)
        .andWhere('archived', false)
        .then(({ count }) => { return { count }; });
}

module.exports = {
    isExists,
    addFiles,
    addLink,
    addPoll,
    addPollOption,
    create,
    getOne,
    update,
    deleteOne,
    getAllTrending,
    getAllSearched,
    getAllByProfile,
    getAllByCommunity,
    getAllDashboard,
    getAllCountByProfile,
    getAllCountByCommunity,
    getAllByTag
};
