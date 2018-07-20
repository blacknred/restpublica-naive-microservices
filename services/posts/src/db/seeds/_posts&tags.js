const faker = require('faker');
const helpers = require('../_helpers');

const isTest = process.env.NODE_ENV === 'test';
let tags;

const createTag = (knex, title) => {
    return knex('tags')
        .insert({
            title
        })
        .catch(err => console.log(err));
};

const createTagMapping = (knex, id, postId) => {
    return knex('posts_tags')
        .insert({
            tag_id: id,
            post_id: postId
        })
        .catch(err => console.log(err));
};

const createPost = (knex, i) => {
    const isTagged = Math.random() >= 0.5;
    let tagsIndexes;
    const post = {
        slug: helpers.genSlug(),
        author_id: Math.floor(Math.random() * (isTest ? 3 : 40)) + 1,
        type: 'file',
        views_cnt: Math.floor(Math.random() * (isTest ? 30 : 500)) + 1,
        created_at: faker.date.past()
    };
    if (i % 3 === 0) {
        post.community_id = Math.floor(Math.random() * (isTest ? 2 : 10)) + 1;
    }

    // if with tags
    // one or many tags
    // add tag/tags to description
    // save post
    // save post/tag relation
    if (isTagged) {
        const tagsCount = Math.floor(Math.random() * (3)) + 1;
        tagsIndexes = helpers.genUniqueNumbersArr(tagsCount, tags.count);
        post.description = faker.lorem.sentences() + tagsIndexes.map(index => ` ${tags[index]}`);
    } else post.description = faker.lorem.sentences();

    return knex('posts')
        .insert(post)
        .then(() => isTagged && tagsIndexes.map(index => createTagMapping(knex, index, i)))
        .catch(err => console.log(err));
};

exports.seed = (knex, Promise) => {
    return knex('posts')
        .del()
        .then(() => {
            // seed tags
            const records = [];
            if (process.env.NODE_ENV === 'isTest') tags = ['politic', 'netflix', 'thetruth'];
            else tags = helpers.genUniqueTitlesArr(30);
            tags.forEach(tag => records.push(createTag(knex, tag)));
            return Promise.all(records);
        })
        .then(() => {
            // seed posts
            const records = [];
            for (let i = 0; i < (isTest ? 10 : 500); i++) {
                records.push(createPost(knex, i));
            }
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
