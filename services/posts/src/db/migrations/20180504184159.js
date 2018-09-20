exports.up = (knex) => {
    return knex.schema
        .createTable('posts', (table) => {
            table.increments();
            table.string('slug').unique().notNullable();
            table.integer('author_id').notNullable();
            table.integer('community_id');
            table.string('type').notNullable();
            table.text('description');
            table.boolean('commentable').notNullable().defaultTo(true);
            table.boolean('archived').notNullable().defaultTo(false);
            table.integer('views_cnt').notNullable().defaultTo(0);
            table.timestamps(true, true);
        })
        .createTable('files', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            table.foreign('post_id').references('posts.id');
            table.string('mime').notNullable();
            table.string('file').notNullable();
            table.string('thumb').notNullable();
        })
        .createTable('links', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            table.foreign('post_id').references('posts.id');
            table.string('type').notNullable();
            table.string('link').notNullable();
            table.string('src').notNullable();
            table.string('img');
            table.string('title');
            table.string('description');
        })
        .createTable('polls_options', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            table.foreign('post_id').references('posts.id');
            table.text('text').notNullable();
            table.string('img');
            table.string('thumb');
            table.datetime('ends_at');
        })
        .createTable('polls_voices', (table) => {
            table.increments();
            table.integer('option_id').notNullable();
            table.foreign('option_id').references('polls_options.id');
            table.integer('user_id').notNullable();
        })
        .createTable('reposts', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            table.foreign('post_id').references('posts.id');
            table.integer('reposted_id').notNullable();
            table.foreign('reposted_id').references('posts.id');
        })
        .createTable('comments', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            table.foreign('post_id').references('posts.id');
            table.integer('user_id').notNullable();
            table.text('body').notNullable();
            table.timestamps(true, true);
        })
        .createTable('comments_likes', (table) => {
            table.increments();
            table.integer('comment_id').notNullable();
            table.foreign('comment_id').references('comments.id');
            table.integer('user_id').notNullable();
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
        .alterTable('comments_likes', (table) => {
            table.unique(['comment_id', 'user_id']);
        })
        .alterTable('polls_voices', (table) => {
            table.unique(['option_id', 'user_id']);
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
        .dropTable('comments_likes')
        .dropTable('post_files')
        .dropTable('post_links')
        .dropTable('post_polls')
        .dropTable('post_polls_options')
        .dropTable('post_polls_voices')
        .dropTable('tags')
        .dropTable('posts_tags');
};

