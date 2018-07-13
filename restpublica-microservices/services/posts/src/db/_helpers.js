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

function genUniqueTitlesArr(length) {
    const strings = [];
    while (strings.length < length) {
        const item = faker.lorem.word();
        if (strings.indexOf(item) === -1) {
            strings.push(item);
        }
    }
    return strings;
}

function genSlug() {
  const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let slug = '';
  while (slug.length < 11) {
    slug += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return slug;
}

module.exports = {
    genUniqueNumbersArr,
    genUniqueTitlesArr,
    genSlug
};
