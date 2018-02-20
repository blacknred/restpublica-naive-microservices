exports.up = (knex) => {
    return knex.schema
        .createTable('users', (table) => {
            table.increments();
            table.string('username').unique().notNullable();
            table.string('fullname').notNullable();
            table.text('description');
            table.string('password').notNullable(); // .unique()
            table.string('email').unique().notNullable();
            table.binary('avatar').notNullable();
            table.boolean('admin').notNullable().defaultTo(false);
            table.datetime('created_at').notNullable().defaultTo(knex.raw('now()'));
            table.datetime('last_post_at');
            table.timestamp('activity_at').notNullable().defaultTo(knex.raw('now()'));
        })
        .createTable('users_subscriptions', (table) => {
            table.increments();
            table.integer('user_id').notNullable();
            table.foreign('user_id').references('users.id');
            table.integer('sub_user_id').notNullable();
            table.foreign('sub_user_id').references('users.id');
            // table.enu('type', ['friend', 'block' ...]).notNullable();
            table.datetime('created_at').notNullable().defaultTo(knex.raw('now()'));
        })
        .alterTable('users_subscriptions', (table) => {
            table.unique(['user_id', 'sub_user_id']);
        });
};

exports.down = (knex) => {
    return knex.schema
        .dropTable('users')
        .dropTable('users_subscriptions');
};

