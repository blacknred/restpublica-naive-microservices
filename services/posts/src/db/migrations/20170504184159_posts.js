const mimeTypes = [
    'text/plain',
    'text/html',
    'image/jpg',
    'image/png',
    'audio/mpeg',
    'audio/mp3',
    'audio/webm',
    'video/mp4',
    'application/octet-stream',
    'application/javascript'
];

exports.up = (knex) => {
    return knex.schema
        .createTable('posts', (table) => {
            table.increments();
            table.integer('user_id').notNullable();
            table.text('description');
            table.integer('views').notNullable().defaultTo(0);
            table.datetime('created_at').notNullable().defaultTo(knex.raw('now()'));
        })
        .createTable('files', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            table.foreign('post_id').references('posts.id');
            table.text('url').notNullable();
            table.enu('content_type', mimeTypes).notNullable();
        })
        .createTable('thumbnails', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            table.foreign('post_id').references('posts.id');
            table.text('url').notNullable();
            table.enu('content_type', mimeTypes).notNullable();
        })
        .createTable('comments', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            table.foreign('post_id').references('posts.id');
            table.integer('user_id').notNullable();
            table.text('comment').notNullable();
            table.datetime('created_at').notNullable().defaultTo(knex.raw('now()'));
        })
        .createTable('likes', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            table.foreign('post_id').references('posts.id');
            table.integer('user_id').notNullable();
        });
};

exports.down = (knex) => {
    return knex.schema
        .dropTable('posts')
        .dropTable('files')
        .dropTable('thumbnails')
        .dropTable('comments')
        .dropTable('likes');
};
