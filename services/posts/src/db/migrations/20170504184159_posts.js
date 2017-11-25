const mimeTypes = [
    'text/plain',
    'text/html',
    'image/jpeg',
    'image/png',
    'audio/mpeg',
    'audio/mp3',
    'audio/webm',
    'video/mp4',
    'application/octet-stream'
];

exports.up = (knex) => {
    return knex.schema
        .createTable('posts', (table) => {
            table.increments();
            table.integer('user_id').notNullable();
            table.text('description');
            table.enu('content_type', mimeTypes);
            table.text('file');
            table.text('thumbnail');
            table.integer('views').notNullable().defaultTo(0);
            table.integer('comments').notNullable().defaultTo(0);
            table.datetime('created_at').notNullable().defaultTo(knex.raw('now()'));
        })
        .createTable('comments', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            // table.foreign('post_id').references('posts.id');
            table.integer('user_id').notNullable();
            table.text('comment').notNullable();
            table.datetime('created_at').notNullable().defaultTo(knex.raw('now()'));
        })
        .createTable('likes', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            // table.foreign('post_id').references('posts.id');
            table.integer('user_id').notNullable();
        });
};

exports.down = (knex) => {
    return knex.schema
        .dropTable('posts')
        .dropTable('comments')
        .dropTable('likes');
};
