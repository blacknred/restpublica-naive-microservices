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

function genUniqueNumbersArr(length, max) {
    const numbers = [];
    while (numbers.length < length) {
        const item = (parseInt(Math.random() * max, 10)) + 1;
        if (numbers.indexOf(item) === -1) {
            numbers.push(item);
        }
    }
    return numbers;
}

function genUniqueTitlesArr(length) {
    const strings = [];
    while (strings.length < length) {
        const item = faker.company.companyName();
        if (strings.indexOf(item) === -1) {
            strings.push(item);
        }
    }
    return strings;
}

module.exports = {
    createAvatar,
    createTheme,
    genUniqueNumbersArr,
    genUniqueTitlesArr
};
