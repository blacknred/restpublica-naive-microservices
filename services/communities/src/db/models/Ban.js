/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */

const util = require('util');
const knex = require('../../db/connection');

const LIMIT = 12;

/* bans */

function createBan(newBan) {
    // upsert
    const insert = knex('communities_bans').insert(newBan);
    const update = knex('communities_bans').update(newBan);
    const query = util.format(
        '%s ON CONFLICT (community_id, user_id) DO UPDATE SET %s RETURNING id',
        insert.toString(),
        update.toString().replace(/^update\s.*\sset\s/i, '')
    );
    return knex.raw(query)
        .then((data) => { return { subscription_id: data.rows[0].id }; });
}

function getBans(communityId, offset) {
    const today = new Date();
    return knex('communities_bans')
        .select(['id', 'user_id', 'end_date'])
        .where('community_id', communityId)
        .andWhere('end_date', '>', today)
        .limit(LIMIT)
        .offset(offset * LIMIT)
        .then((rows) => {
            return knex('communities_bans')
                .count('*')
                .where('community_id', communityId)
                .andWhere('end_date', '>', today)
                .first()
                .then((count) => { return { count: count.count, users: rows }; });
        });
}

function deleteBans(communityId, adminId) {
    return knex('communities_bans')
        .del()
        .leftJoin('communities', 'communities.id', 'communities_bans.community_id')
        .where('community_id', communityId)
        .andWhere('communities.admin_id', adminId);
}


module.exports = {
    createBan,
    getBans,
    deleteBans
};
