const bcrypt = require('bcryptjs');
const faker = require('faker');
const helpers = require('../_helpers');
const routeHelpers = require('../../routes/_helpers');

const salt = bcrypt.genSaltSync();

const createUser = (knex, username) => {
    const hash = bcrypt.hashSync('password5', salt);
    const fullname = faker.name.findName();
    return Promise.all([
        routeHelpers.createAvatar(fullname),
        routeHelpers.createBanner()
    ])
        .then(([avatar, banner]) => {
            return knex('users')
                .insert({
                    username,
                    fullname,
                    description: faker.lorem.sentences(),
                    password: hash,
                    email: faker.internet.email(),
                    avatar,
                    banner,
                    last_post_at: new Date()
                });
        })
        .catch(err => console.log(err));
};

exports.seed = (knex, Promise) => {
    return knex('users')
        .del()
        .then(() => {
            const records = [];
            let usernames;
            if (process.env.NODE_ENV === 'test') usernames = ['mark', 'hugo', 'ania'];
            else usernames = helpers.genUniqueNamesArr(40);
            usernames.forEach((username, i) => records.push(createUser(knex, username, i)));
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
