const helpers = require('../_helpers');

const isTest = process.env.NODE_ENV === 'test';

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
            if (isTest) tags = ['politic', 'netflix', 'thetruth'];
            else tags = helpers.genUniqueTitlesArr(30);
            tags.forEach(tag => records.push(createTag(knex, tag)));
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
