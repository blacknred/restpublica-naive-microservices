const util = require('util');
const knex = require('./../connection');

const LIMIT = 12;
const MOBILE_LIMIT = 6;

/* likes */

function getAll({ postId, offset, reduced }) {
    return knex('polls_options')
        .select('id')
        .where('post_id', postId)
        .then((ids) => {
            return knex('polls_voices')
                .select('*')
                .whereIn('option_id', ids)
                .limit(reduced ? MOBILE_LIMIT : LIMIT)
                .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
                .then((data) => {
                    return knex('polls_voices')
                        .count('*')
                        .whereIn('option_id', ids)
                        .first()
                        .then(({ count }) => { return { count, data }; });
                });
        });
}

function create(newVote) {
    // upsert
    const insert = knex('polls_voices').insert(newVote);
    const update = knex('polls_voices').update(newVote);
    const query = util.format(
        '%s ON CONFLICT (option_id, user_id) DO UPDATE SET %s RETURNING id',
        insert.toString(),
        update.toString().replace(/^update\s.*\sset\s/i, '')
    );
    return knex.raw(query).then(({ rows }) => { return { id: rows[0].id }; });
}

function deleteOne(postId, userId) {
    return knex('polls_options')
        .select('id')
        .where('post_id', postId)
        .then((ids) => {
            return knex('polls_voices')
                .whereIn('option_id', ids.map(id => id.id))
                .where('user_id', userId)
                .del();
        })
        .then(() => { return { id: postId }; });
}

module.exports = {
    create,
    getAll,
    deleteOne
};
