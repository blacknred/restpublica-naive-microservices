const helpers = require('../_helpers');

const ISTEST = process.env.NODE_ENV === 'test';
const TAGS_CNT = 30;

const createTag = (knex, title) => {
    return knex('tags')
        .insert({ title })
        .catch(err => console.log(err));
};

exports.seed = (knex, Promise) => {
    return knex('tags')
        .del()
        .then(() => {
            const records = [];
            let tags;
            if (ISTEST) tags = ['politic', 'netflix', 'thetruth'];
            else tags = helpers.genUniqueTitlesArr(TAGS_CNT);
            tags.forEach(tag => records.push(createTag(knex, tag)));
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
