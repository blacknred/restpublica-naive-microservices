/* eslint-disable */
const faker = require('faker');
const fetch = require('node-fetch');

function createAvatar(fullname) {
    const name = fullname.replace(' ', '+');
    const background = faker.internet.color().replace('#', '');
    const url = `https://ui-avatars.com/api/?name=${name}&size=128&background=${background}`;
    return fetch(url)
        .then((data) => {
            return data.buffer();
        })
        .then((buffer) => {
            return buffer;
        })
        .catch((err) => {
            console.log(err.message);
        });
}

function createTheme() {
    const url = faker.image.abstract();
    return fetch(url)
        .then((data) => {
            return data.buffer();
        })
        .then((buffer) => {
            return buffer;
        })
        .catch((err) => {
            console.log(err.message);
        });
}

module.exports = {
    createAvatar,
    createTheme
}