const helpers = require('../_helpers');

const createLike = (knex, title) => {
    return knex('tags')
        .insert({
            title
        })
        .catch(err => console.log(err));
};

exports.seed = (knex, Promise) => {
    return knex('tags')
        .del()
        .then(() => {
            const records = [];
            let titles;
            if (process.env.NODE_ENV === 'test') titles = ['politic', 'netflix', 'thetruth'];
            else titles = helpers.genUniqueTitlesArr(30);
            titles.forEach(title => records.push(createLike(knex, title)));
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
