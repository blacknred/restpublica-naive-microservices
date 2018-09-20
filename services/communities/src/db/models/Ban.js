const util = require('util');

const knex = require('../../db/connection');

const LIMIT = 12;
const MOBILE_LIMIT = 6;

/* bans */

function isExist(communityId, userId) {
    const today = new Date();
    return knex('communities_bans')
        .select('user_id')
        .where('id', communityId)
        .andWhere('user_id', userId)
        .andWhere('end_date', '>', today)
        .first();
}

function create(newBan) {
    // upsert
    const insert = knex('communities_bans').insert(newBan);
    const update = knex('communities_bans').update(newBan);
    const query = util.format(
        '%s ON CONFLICT (community_id, user_id) DO UPDATE SET %s RETURNING id',
        insert.toString(),
        update.toString().replace(/^update\s.*\sset\s/i, '')
    );
    return knex.raw(query).first();
}

function getAll({ communityId, offset, reduced }) {
    const today = new Date();
    return knex('communities_bans')
        .select(['id', 'user_id', 'end_date'])
        .where('community_id', communityId)
        .andWhere('end_date', '>', today)
        .limit(reduced ? MOBILE_LIMIT : LIMIT)
        .offset(offset * (reduced ? MOBILE_LIMIT : LIMIT))
        .then((profiles) => {
            return knex('communities_bans')
                .count('*')
                .where('community_id', communityId)
                .andWhere('end_date', '>', today)
                .first()
                .then(({ count }) => ({ count, profiles }));
        });
}

function deleteAll(communityId, adminId) {
    return knex('communities_bans')
        .del()
        .leftJoin('communities', 'communities.id', 'communities_bans.community_id')
        .where('community_id', communityId)
        .andWhere('communities.admin_id', adminId);
}


module.exports = {
    isExist,
    create,
    getAll,
    deleteAll
};
