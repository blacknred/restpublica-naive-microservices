const bcrypt = require('bcryptjs');
const faker = require('faker');

const authHelpers = require('../../auth/_helpers');

const salt = bcrypt.genSaltSync();

const createUser = (knex) => {
    const hash = bcrypt.hashSync('herman5', salt);
    const username = faker.name.firstName();
    return authHelpers.createAvatar(username)
        .then((avatar) => {
            return knex('users').insert({
                username,
                fullname: faker.name.findName(),
                description: faker.lorem.sentences(),
                password: hash,
                email: faker.internet.email(),
                avatar
            });
        });
};

exports.seed = (knex, Promise) => {
    return knex('users').del()
        .then(() => {
            const records = [];
            for (let i = 1; i <= 20; i++) {
                records.push(createUser(knex));
            }
            return Promise.all(records);
        })
        .catch((err) => { console.log(err); }); // eslint-disable-line
};
