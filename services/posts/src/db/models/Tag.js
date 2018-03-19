const knex = require('./../connection');

const LIMIT = 12;

/* tags TODO: get posts count */

function getTrendingTags(offset) {
    const today = new Date();
const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
    return knex('posts_tags')
        .select('tag_id')
        .where('created_at', '>', lastWeek)
        .groupBy('tag_id')
        .orderByRaw('COUNT(tag_id) DESC')
        .limit(LIMIT)
        .offset(offset * LIMIT)
        .map((_row) => {
            return knex('tags')
                .select('title')
                .where('id', _row.tag_id)
                .first();
        })
        .then(rows => rows.map(tag => tag.title));
}

function getSearchedTags(pattern, offset) {
    return knex('tags')
        .select('title')
        .whereRaw('LOWER(title) like ?', `%${pattern}%`)
        .limit(LIMIT)
        .offset(LIMIT * offset)
        .then(rows => rows.map(tag => tag.title));
}


module.exports = {
    getTrendingTags,
    getSearchedTags
};
