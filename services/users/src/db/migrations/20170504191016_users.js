exports.up = (knex) => {
    return knex.schema
        .createTable('users', (table) => {
            table.increments();
            table.string('name').unique().notNullable();
            table.string('fullname').notNullable();
            table.string('password').notNullable();
            table.string('email').unique().notNullable();
            table.binary('avatar').notNullable();
            table.boolean('admin').notNullable().defaultTo(false);
            table.datetime('created_at').notNullable().defaultTo(knex.raw('now()'));
            table.timestamp('activity_at').notNullable().defaultTo(knex.raw('now()'));
        })
        .createTable('subscriptions', (table) => {
            table.increments();
            table.integer('user_id').notNullable();
            // table.foreign('user_id').references('users.id');
            table.integer('sub_user_id').notNullable();
            // table.foreign('sub_user_id').references('users.id');
        })
        .alterTable('subscriptions', (table) => {
            table.unique(['user_id', 'sub_user_id']);
        });
};

exports.down = (knex) => {
    return knex.schema
        .dropTable('subscriptions')
        .dropTable('users');
};
