const faker = require('faker');
const helpers = require('../_helpers');

const ISTEST = process.env.NODE_ENV === 'test';
const USERS_CNT = 40;
const POSTS_CNT = 500;
const COMMENTS_CNT = POSTS_CNT * 10;


const createCommentLike = (knex, userId, comId) => {
    return knex('comments_likes')
        .insert({
            comment_id: comId,
            user_id: userId
        })
        .catch(err => console.log(err));
};

const createComment = (knex, comId) => {
    const isLiked = Math.random() >= 0.5;
    let usersIds;

    // if with likes
    if (isLiked) {
        const likesCount = Math.floor(Math.random() * (USERS_CNT / 2)) + 1;
        usersIds = helpers.genUniqueNumbersArr(likesCount, USERS_CNT);
    }

    return knex('comments')
        .insert({
            post_id: Math.floor(Math.random() * (ISTEST ? 10 : POSTS_CNT)) + 1,
            user_id: Math.floor(Math.random() * (ISTEST ? 3 : USERS_CNT)) + 1,
            body: faker.lorem.sentences(),
            created_at: faker.date.past()
        })
        .then(() => {
            const records = [];
            if (isLiked) {
                usersIds.forEach(userId => records.push(createCommentLike(knex, userId, comId)));
            }
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};

exports.seed = (knex, Promise) => {
    return knex('comments_likes')
        .del()
        .then(() => {
            return knex('comments')
                .del()
                .then(() => {
                    const records = [];
                    for (let i = 1; i < (ISTEST ? 100 : COMMENTS_CNT); i++) {
                        records.push(createComment(knex, i));
                    }
                    return Promise.all(records);
                })
                .catch(err => console.log(err));
        });
};
