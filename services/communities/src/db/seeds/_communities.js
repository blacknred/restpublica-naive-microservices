const faker = require('faker');
const helpers = require('../_helpers');
const routeHelpers = require('../../routes/_helpers');

const COMMUNITIES_CNT = 15;
const USERS_CNT = 40;

function createCommunity(knex, name, adminId) {
    return Promise.all([
        routeHelpers.createAvatar(name),
        routeHelpers.createBanner()
    ])
        .then(([avatar, banner]) => {
            return knex('communities')
                .insert({
                    name: name.split(' ')[0].toLowerCase(),
                    title: name,
                    description: faker.lorem.sentences(),
                    avatar,
                    banner,
                    admin_id: adminId,
                    last_post_at: new Date()
                });
        })
        .catch(err => console.log(err));
}

exports.seed = (knex, Promise) => {
    return knex('communities')
        .del()
        .then(() => {
            const records = [];
            let names;
            let admins;
            if (process.env.NODE_ENV === 'test') {
                names = ['Chelsea', 'Winter'];
                admins = [1, 2];
            } else {
                names = helpers.genUniqueNamesArr(COMMUNITIES_CNT);
                admins = helpers.genUniqueNumbersArr((USERS_CNT / 2), USERS_CNT);
            }
            names.forEach((name, i) => {
                records.push(createCommunity(knex, name, admins[i]));
            });
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};

