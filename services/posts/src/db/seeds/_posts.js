/* eslint-disable no-unused-vars */

const faker = require('faker');
const request = require('request-promise');
const helpers = require('../_helpers');

const POSTS_CNT = 500;
const USERS_CNT = 40;
const IS_TEST = process.env.NODE_ENV === 'test';
const STORAGE = `http://files-storage:3000?seedFrom=${process.env.NODE_ENV}`;
const IMG_SIZES = ['600x600', '600x700', '600x800'];
const IMG_COLLECTIONS = ['1111575', '582659', '494266'];
const IMG_SRC = 'https://source.unsplash.com/collection';

const tags = [];
const fetchedImgs = [];

const fetchImg = () => {
    const conf = {
        url: `${IMG_SRC}/` +
            `${IMG_COLLECTIONS[Math.floor(Math.random() * IMG_COLLECTIONS.length)]}/` +
            `${IMG_SIZES[Math.floor(Math.random() * IMG_SIZES.length)]}/` +
            `?sig=${Math.floor(Math.random() * POSTS_CNT)}`,
        headers: {
            Connection: 'keep-alive',
            'Accept-Encoding': '',
            'Accept-Language': 'en-US,en;q=0.8'
        },
        gzip: true,
        encoding: null,
        resolveWithFullResponse: true,
    };
    return request(conf)
        .then((res) => {
            console.log(conf.url, res.body.length);
            fetchedImgs.push(res.body);
            return null;
        })
        .catch(err => console.log(err.message));
};

/* */

const createPost = (knex, i) => {
    const post = {
        slug: helpers.genSlug(),
        author_id: Math.floor(Math.random() * (IS_TEST ? 3 : USERS_CNT)) + 1,
        type: 'file',
        description: faker.lorem.sentences(),
        views_cnt: Math.floor(Math.random() * (IS_TEST ? 30 : POSTS_CNT)) + 1,
        created_at: faker.date.past(),
        ...(i % 3 === 0 && {
            community_id: Math.floor(Math.random() * (IS_TEST ? 2 : 10)) + 1
        })
    };
    const requestConf = {
        method: 'POST',
        uri: STORAGE,
        formData: {
            file: {
                value: fetchedImgs[i],
                options: {
                    filename: `file${fetchedImgs[i].length}.jpg`,
                    contentType: 'image/jpg'
                }
            },
        },
        json: true,
        gzip: true,
    };
    // create tags for post
    const tagsData = [];
    if (Math.random() >= 0.5) {
        const tagsCount = Math.floor(Math.random() * (3)) + 1;
        const tagsIndexes = helpers.genUniqueNumbersArr(tagsCount, tags.length);
        post.description += ' ';
        post.description += tagsIndexes.map(index => `#${tags[index - 1]}`).join(' ');
        tagsIndexes.forEach((index) => {
            tagsData.push({
                tag_id: index,
                post_id: i + 1
            });
        });
    }

    return knex('posts')
        .insert(post)
        .then(() => knex('posts_tags').insert(tagsData))
        .then(() => request(requestConf))
        .then((data) => {
            return knex('files')
                .insert({
                    post_id: i + 1,
                    mime: 'image/jpg',
                    file: data.data[0].file,
                    thumb: data.data[0].thumb
                });
        })
        .catch(err => console.log(err));

    // return knex.transaction((trx) => {
    //     return knex('posts')
    //         .insert(post)
    //         .transacting(trx)
    //         .then(() => {
    //             return knex('posts_tags')
    //                 .insert(tagsData)
    //                 .transacting(trx)
    //                 .then(() => {
    //                     return request(requestConf)
    //                         .then((data) => {
    //                             return knex('files')
    //                                 .insert({
    //                                     post_id: i + 1,
    //                                     mime: 'image/jpg',
    //                                     file: data.data[0].file,
    //                                     thumb: data.data[0].thumb
    //                                 })
    //                                 .transacting(trx);
    //                         })
    //                         .catch(err => console.log(err));
    //                 });
    //         })
    //         .then(trx.commit)
    //         .catch(trx.rollback);
    // })
    // .catch(err => console.log(err));
};

exports.seed = (knex, Promise) => {
    return knex('posts_tags').del()
        .then(() => knex('files').del())
        .then(() => knex('posts').del())
        // get tags
        .then(() => knex('tags').select('*'))
        .map(tag => tags.push(tag.title))
        // get files
        .then(() => {
            const fetches = [];
            for (let i = 1; i <= (IS_TEST ? 10 : POSTS_CNT); i++) {
                fetches.push(fetchImg());
            }
            return Promise.all(fetches);
        })
        .then(() => {
            console.log(`all fetched files count: ${fetchedImgs.length}`);
            const records = [];
            fetchedImgs.forEach((_, i) => records.push(createPost(knex, i)));
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
