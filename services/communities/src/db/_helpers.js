const faker = require('faker');

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

function genUniqueNamesArr(length) {
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
    genUniqueNumbersArr,
    genUniqueNamesArr
};
