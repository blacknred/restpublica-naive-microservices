/* eslint-disable */
const faker = require('faker');
const fetch = require('node-fetch');

function createAvatar(fullname) {
    const name = fullname.replace(' ', '+');
    const background = faker.internet.color().replace('#', '');
    const url = `https://ui-avatars.com/api/?name=${name}&size=128&background=${background}`;
    return fetch(url).then(data => data.buffer());
}

function createTheme() {
    const url = 'https://picsum.photos/800/200/?random';
    return fetch(url).then(data => data.buffer());
}

module.exports = {
    createAvatar,
    createTheme
}