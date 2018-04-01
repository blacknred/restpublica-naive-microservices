exports.up = (knex) => {
    return knex.schema
        .createTable('communities', (table) => {
            table.increments();
            table.string('name').unique().notNullable();
            table.string('title').notNullable();
            table.text('description');
            table.binary('avatar').notNullable();
            table.binary('banner');
            table.boolean('restricted').notNullable().defaultTo(false);
            table.boolean('posts_moderation').notNullable().defaultTo(false);
            table.integer('admin_id').notNullable();
            table.boolean('active').notNullable().defaultTo(true);
            table.datetime('last_post_at');
            table.timestamps(true, true);
        })
        .createTable('communities_subscriptions', (table) => {
            table.increments();
            table.integer('community_id').notNullable();
            table.foreign('community_id').references('communities.id');
            table.integer('user_id').notNullable();
            table.boolean('approved').notNullable().defaultTo(false);
            table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
        })
        .createTable('communities_bans', (table) => {
            table.increments();
            table.integer('community_id').notNullable();
            table.foreign('community_id').references('communities.id');
            table.integer('user_id').notNullable();
            table.datetime('end_date').notNullable().defaultTo(knex.raw('now() + INTERVAL \'1 DAY\''));
        })
        .alterTable('communities_subscriptions', (table) => {
            table.unique(['community_id', 'user_id']);
        })
        .alterTable('communities_bans', (table) => {
            table.unique(['community_id', 'user_id']);
        });
};

exports.down = (knex) => {
    return knex.schema
        .dropTable('communities')
        .dropTable('communities_subscriptions')
        .dropTable('communities_bans');
};
