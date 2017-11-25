const sharp = require('sharp');
const fetch = require('node-fetch');
const path = require('path');

const faker = require('faker');

function fet(image) {
    return fetch(image)
        .then((res) => {
            return res.buffer();
        })
        .then((buffer) => {
            return buffer;
        })
        .catch(() => {
            return null;
        });
}

const createPost = (knex, i) => {
    const image = faker.image.image();
    const imageThumb = path.join(__dirname, '../../../storage/thumbs', `thumb_${i}.png`);
    return fet(image)
        .then((img) => {
            sharp(img)
                .resize(200)
                .toFile(imageThumb)
                .then(() => {
                    return knex('posts')
                        .insert({
                            user_id: Math.floor((Math.random() * 10) + 1),
                            description: faker.lorem.sentences(),
                            content_type: 'image/png',
                            file: image,
                            thumbnail: imageThumb
                        });
                });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.seed = (knex, Promise) => {
    return knex('posts').del()
        .then(() => {
            const records = [];
            for (let i = 1; i < 30; i++) {
                records.push(createPost(knex, i));
            }
            return Promise.all(records);
        })
        .catch((err) => {
            console.log(err);
        });
};
