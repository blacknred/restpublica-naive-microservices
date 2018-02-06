/*
Content posting system

* No post without content: img(collage) | video | link(img,videohosting,file,page) | poll
* Post structure:
    - slug
    - author_id
    - community_id
    - content_type: ['imgs', 'video', 'link', 'poll']
    - commentable
    - archive
    - ?description
* Process
         * Content:
        |             | img(f,l)       | video(f)       | embed(l)  | file(l) | page(l) |
        |-------------|----------------|----------------|-----------|---------|---------|
        | post_id     |                |                |           |         |         |
        | type        | img            | video          | embed     | file    | page    |
        | content_url | storage|remote | storage        | rem embed | remote  | remote  |
        | ?thumb_url  | storage        | storage        | remote    | -       | remote  |
        | ?mime       | [jpg|png|gif]  | [mp4|webm]     | -         | -       | -       |
        | ?title      | -      | -     | -      | -     | -         | title   | title   |

        * Files
        |             | img            | video          |
        |-------------|----------------|----------------|
        | post_id     |                |                |
        | mime        | [jpg|png|gif]  | [mp4|webm]     |
        | file        | storage        | storage        |
        | thumb       | storage        | storage        |

        * Links
        |             | embed     | file     | page    |
        |-------------|-----------|----------|---------|
        | post_id     |           |          |         |
        | type        | embed     | file     | page    |
        | link        | remote    | remote   | remote  |
        | thumb       | storage   | ?storage | storage |
        | src         | -         | src      | src     |
        | title       | -         | -        | title   |
        file check if thumb -> component1 else -> component2

        * Polls:
        |          | polls_options | polls_voices |
        |----------|---------------|--------------|
        | post_id  | poll_id       | option_id    |
        | subject  | option        | user_id      |
        | ?ends_at | ?img          |              |
       
    * content
        - img(jpg,png,gif up to 10MB)
            -> load img -> PostsService makeThumb(sharp) -> thumb preview -> [req.body...,files]
            >- img files -> mime,file_path,thumb_path -> db
        - video(mp4,webm up to 10MB)
            -> load video -> PostsService makeThumb(video-thumb) -> thumb preview -> [req.body...,files]
            >- video file -> mime,file_path,thumb_path -> db
        - link
            - jpg,png,gif
                -> add link -> PostsService makeThumb(sharp) -> thumb preview -> [req.body...,link]
                >- img link -> link,thumb_path -> db

            - videohosting(youtube, vimeo, facebook)
                -> add link -> video-thumbnail-url lib -> thumb preview -> [req.body...,link,thumbPath]
                >- link,thumbPath -> db
            - pdf, mp4...
                -> add link -> [req.body...,link]
                >- link body -> link,title -> db
            - page
                -> add link -> metafetch lib -> title,thumb preview -> [req.body...,link,title,thumbPath]
                >- type,link,title,thumbPath -> db
        - poll
            >- subject, ends_at, options{option,img}
        - ??streams 'application/octet-stream'
    * req.body:
        - contentType: ['img', 'video', 'link', 'poll']
        - commentable
        - archive
        - ?communityId
        - ?description
        - tags

        - ?link {url,type,?title,?thumb}
        - ?poll {subject, ends_at, options{option}}
    - ?files

* Post also may include tags
*/

exports.up = (knex) => {
    return knex.schema
        .createTable('posts', (table) => {
            table.increments();
            table.string('slug').unique().notNullable();
            table.integer('author_id').notNullable();
            table.integer('community_id');
            table.enu('content_type', ['file', 'link']).notNullable();
            table.text('description');
            table.boolean('commentable').notNullable().defaultTo(true);
            table.boolean('archive').notNullable().defaultTo(false);
            table.integer('views_cnt').notNullable().defaultTo(0);
            table.datetime('created_at').notNullable().defaultTo(knex.raw('now()'));
        })
        .createTable('files', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            table.foreign('post_id').references('posts.id');
            table.enu('mime', [
                'image/jpg',
                'image/png',
                'image/gif',
                'audio/webm',
                'video/mp4'
            ]).notNullable();
            table.string('file_path').notNullable();
            table.string('thumb_path').notNullable();
        })
        .createTable('links', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            table.foreign('post_id').references('posts.id');
            table.enu('type', ['img', 'embed', 'file', 'page']).notNullable();
            table.string('link').notNullable();
            table.string('title');
            table.string('thumb_path');
        })
        .createTable('polls', (table) => {
            table.increments();
            table.integer('post_id').notNullable();
            table.foreign('post_id').references('posts.id');
            table.text('subject').notNullable();
            table.datetime('ends_at');
        })
        .createTable('polls_options', (table) => {
            table.increments();
            table.integer('poll_id').notNullable();
            table.foreign('poll_id').references('polls.id');
            table.string('option').notNullable();
            table.string('img');
        })
        .createTable('polls_voices', (table) => {
            table.increments();
            table.integer('option_id').notNullable();
            table.foreign('option_id').references('polls_options.id');
            table.number('user_id').notNullable();
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
        })
        .createTable('api_plans', (table) => {
            table.increments();
            table.string('name').unique().notNullable();
            table.integer('limit_per_hour').unique().notNullable();
            table.integer('price').notNullable().defaultTo(0);
            table.datetime('created_at').notNullable().defaultTo(knex.raw('now()'));
        })
        .createTable('api_partners', (table) => {
            table.increments();
            table.integer('api_key').notNullable();
            table.integer('plan_id').notNullable();
            table.foreign('plan_id').references('api_plans.id');
            table.datetime('created_at').notNullable().defaultTo(knex.raw('now()'));
        });
};

exports.down = (knex) => {
    return knex.schema
        .dropTable('api_partners')
        .dropTable('api_plans')
        .dropTable('files')
        .dropTable('comments')
        .dropTable('likes')
        .dropTable('tags')
        .dropTable('posts_tags')
        .dropTable('posts');
};

