/* eslint-disable */
const faker = require('faker');
const fetch = require('node-fetch');
const gm = require('gm');

function createAvatar(fullname) {
    const name = fullname.replace(' ', '+');
    const background = faker.internet.color().replace('#', '');
    const url = `https://ui-avatars.com/api/?name=${name}&size=128&background=${background}`;
    return fetch(url)
        .then((data) => {
            return data.buffer();
        });
}

function createTheme() {
    const url = 'https://picsum.photos/640/480/?random';
    return fetch(url)
        .then((data) => {
            return data.buffer();
        })
        .then((buffer) => {
            return gm(buffer)
                .resize(640, 100)
                .toBuffer('JPG', (err, buffer) => {
                    if (err) throw new Error(err);
                    return buffer;
                });
        });
}

module.exports = {
    createAvatar,
    createTheme
}