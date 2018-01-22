const faker = require('faker');
const helpers = require('../_helpers');

const createCommunity = (knex, title, adminId) => {
    return Promise.all([
        helpers.createAvatar(title),
        helpers.createTheme()
    ])
        .then((imgs) => {
            const [avatar, theme] = imgs;
            return knex('communities')
                .insert({
                    title,
                    description: faker.lorem.sentences(),
                    avatar,
                    theme,
                    admin_id: adminId
                });
        })
        .catch(err => console.log(err));
};

exports.seed = (knex, Promise) => {
    return knex('communities')
        .del()
        .then(() => {
            const records = [];
            const titles = helpers.genUniqueTitlesArr(10);
            console.log(`titles: ${titles.length}`);
            const admins = helpers.genUniqueNumbersArr(10, 40);
            console.log(`admins: ${admins.length}`);
            titles.forEach((title, i) => {
                records.push(createCommunity(knex, title, admins[i]));
            });
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};

