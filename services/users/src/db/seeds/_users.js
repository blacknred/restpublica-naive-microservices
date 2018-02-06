const bcrypt = require('bcryptjs');
const faker = require('faker');

const helpers = require('../_helpers');
const routeHelpers = require('../../routes/_helpers');

const salt = bcrypt.genSaltSync();

const createUser = (knex, username) => {
    const hash = bcrypt.hashSync('herman5', salt);
    const fullname = faker.name.findName();
    return routeHelpers.createAvatar(fullname)
        .then((avatar) => {
            return knex('users')
                .insert({
                    username,
                    fullname,
                    description: faker.lorem.sentences(),
                    password: hash,
                    email: faker.internet.email(),
                    avatar
                });
        })
        .catch(err => console.log(err));
};

exports.seed = (knex, Promise) => {
    return knex('users')
        .del()
        .then(() => {
            const records = [];
            const usernames = helpers.genUniqueNamesArr(40);
            console.log(`usersnames: ${usernames.length}`);
            usernames.forEach(username => records.push(createUser(knex, username)));
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
