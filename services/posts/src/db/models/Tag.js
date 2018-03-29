/* eslint-disable no-confusing-arrow */

const util = require('util');
const knex = require('./../connection');

const LIMIT = 12;

/* tags */

function create(tag) {
    // upsert
    const inserts = knex('tags').insert({ title: tag });
    const updates = knex('tags').update({ title: tag });
    const query = util.format(
        '%s ON CONFLICT (title) DO UPDATE SET %s RETURNING id',
        inserts.toString(),
        updates.toString().replace(/^update\s.*\sset\s/i, '')
    );
    return knex.raw(query).then(({ rows }) => rows[0].id);
}

function addOneToPost(tagId, postId) {
    // upsert
    const inserts = knex('posts_tags').insert({ tag_id: tagId, post_id: postId });
    const updates = knex('posts_tags').update({ tag_id: tagId, post_id: postId });
    const query = util.format(
        '%s ON CONFLICT (tag_id, post_id) DO UPDATE SET %s RETURNING id',
        inserts.toString(),
        updates.toString().replace(/^update\s.*\sset\s/i, '')
    );
    return knex.raw(query).then(({ rows }) => rows[0].id);
}

function deleteAllFromPost(postId) {
    return knex('posts_tags')
        .del()
        .where('post_id', postId);
}

function postsCount(tag) {
    return knex('posts_tags')
        .countDistinct('post_id')
        .where('tag_id', tag.id)
        .first()
        .then(({ count }) => {
            return Object.assign(tag, { posts_cnt: count });
        });
}

function getAllTrending(offset) {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(),
        today.getMonth(), today.getDate() - 21);
    return knex('posts_tags')
        .select('posts_tags.tag_id')
        .where('posts_tags.created_at', '>', lastMonth)
        .groupBy('posts_tags.tag_id')
        .orderByRaw('COUNT(posts_tags.tag_id) DESC')
        .limit(LIMIT)
        .offset(offset * LIMIT)
        .map((_row) => {
            if (!_row) return _row;
            return knex('tags')
                .select('tags.*')
                .leftJoin('posts_tags', 'posts_tags.tag_id', 'tags.id')
                .where('posts_tags.tag_id', _row.tag_id)
                .first();
        })
        .map(_row => _row ? postsCount(_row) : _row);
}

function getAllSearched(pattern, offset) {
    return knex('tags')
        .select('*')
        .whereRaw('LOWER(title) like ?', `%${pattern}%`)
        .limit(LIMIT)
        .offset(LIMIT * offset)
        .map(_row => _row ? postsCount(_row) : _row);
}


module.exports = {
    create,
    addOneToPost,
    deleteAllFromPost,
    getAllTrending,
    getAllSearched
};
