const faker = require('faker');
const helpers = require('../_helpers');
const routeHelpers = require('../../routes/_helpers');

function createCommunity(knex, name, adminId) {
    let avatar;
    return routeHelpers.createAvatar(name)
        .then((res) => {
            avatar = res;
            return routeHelpers.createBanner();
        })
        .then((banner) => {
            return knex('communities')
                .insert({
                    name: name.split(' ')[0],
                    title: name,
                    description: faker.lorem.sentences(),
                    avatar,
                    banner,
                    admin_id: adminId
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
                names = helpers.genUniqueNamesArr(10);
                admins = helpers.genUniqueNumbersArr(10, 40);
            }
            names.forEach((name, i) => {
                records.push(createCommunity(knex, name, admins[i]));
            });
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};

