exports.up = (knex) => {
    return knex.schema
        .createTable('posts', (table) => {
            table.increments();
            table.string('slug').unique().notNullable();
            table.integer('author_id').notNullable();
            table.integer('community_id');
            table.enu('type', ['file', 'link', 'poll']).notNullable();
            table.text('description');
            table.boolean('commentable').notNullable().defaultTo(true);
            table.boolean('archived').notNullable().defaultTo(false);
            table.integer('views_cnt').notNullable().defaultTo(0);
            table.datetime('created_at').notNullable().defaultTo(knex.raw('now()'));
        })
        .createTable('post_files', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            table.foreign('post_id').references('posts.id');
            table.enu('mime', ['image/jpg', 'image/gif', 'video/mp4']).notNullable();
            table.string('file').notNullable();
            table.string('thumb').notNullable();
        })
        .createTable('post_links', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            table.foreign('post_id').references('posts.id');
            table.enu('type', ['embed', 'file', 'page']).notNullable();
            table.string('link').notNullable();
            table.string('src').notNullable();
            table.string('thumb');
            table.string('title');
        })
        .createTable('post_polls', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            table.foreign('post_id').references('posts.id');
            table.text('subject').notNullable();
            table.datetime('ends_at');
        })
        .createTable('post_polls_options', (table) => {
            table.increments();
            table.integer('poll_id').notNullable();
            table.foreign('poll_id').references('post_polls.id');
            table.string('option').notNullable();
            table.string('img');
        })
        .createTable('post_polls_voices', (table) => {
            table.increments();
            table.integer('option_id').notNullable();
            table.foreign('option_id').references('post_polls_options.id');
            table.integer('user_id').notNullable();
        })
        .createTable('comments', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            table.foreign('post_id').references('posts.id');
            table.integer('user_id').notNullable();
            table.text('body').notNullable();
            table.datetime('created_at').notNullable().defaultTo(knex.raw('now()'));
        })
        .createTable('likes', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            table.foreign('post_id').references('posts.id');
            table.integer('user_id').notNullable();
        })
        .createTable('tags', (table) => {
            table.increments();
            table.string('title').notNullable();
        })
        .createTable('posts_tags', (table) => {
            table.increments();
            table.integer('tag_id').notNullable();
            table.integer('post_id').notNullable();
            table.foreign('post_id').references('posts.id');
            table.datetime('created_at').notNullable().defaultTo(knex.raw('now()'));
        })
        .alterTable('likes', (table) => {
            table.unique(['post_id', 'user_id']);
        })
        .alterTable('tags', (table) => {
            table.unique(['title']);
        })
        .alterTable('posts_tags', (table) => {
            table.unique(['tag_id', 'post_id']);
        });
};

exports.down = (knex) => {
    return knex.schema
        .dropTable('posts')
        .dropTable('likes')
        .dropTable('comments')
        .dropTable('post_files')
        .dropTable('post_links')
        .dropTable('post_polls')
        .dropTable('post_polls_options')
        .dropTable('post_polls_voices')
        .dropTable('tags')
        .dropTable('posts_tags');
};

