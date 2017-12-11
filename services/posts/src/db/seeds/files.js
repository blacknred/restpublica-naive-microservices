const sharp = require('sharp');
const fetch = require('node-fetch');
const request = require('request-promise');
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

const createFile = (knex, i) => {
    const image = faker.image.image();
    const postId = Math.floor((Math.random() * 100) + 1);
    return fet(image)
        .then((imgBuffer) => {
            sharp(imgBuffer)
                .resize(200)
                // .toFormat('jpeg')
                .toBuffer()
                .then((thumbBuffer) => {
                    const options = {
                        method: 'POST',
                        uri: 'http://posts-storage:3003/',
                        formData: {
                            thumb: {
                                value: thumbBuffer,
                                options: {
                                    filename: `thumb_${i}.jpg`,
                                    contentType: 'image/jpg'
                                }
                            }
                        },
                        headers: {
                            /* 'content-type': 'application/x-www-form-urlencoded' */
                        }
                    };
                    return request(options)
                        .then((body) => {
                            const response = JSON.parse(body);
                            return knex('thumbnails')
                                .insert({
                                    post_id: postId,
                                    url: response[0].url,
                                    content_type: response[0].mime
                                });
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                })
                .then(() => {
                    const options = {
                        method: 'POST',
                        uri: 'http://posts-storage:3003/',
                        formData: {
                            file: {
                                value: imgBuffer,
                                options: {
                                    filename: `file_${i}.jpg`,
                                    contentType: 'image/jpg'
                                }
                            }
                        },
                        headers: {
                            /* 'content-type': 'application/x-www-form-urlencoded' */
                        }
                    };
                    return request(options)
                        .then((body) => {
                            const response = JSON.parse(body);
                            return knex('files')
                                .insert({
                                    post_id: postId,
                                    url: response[0].url,
                                    content_type: response[0].mime
                                });
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                })
                .catch((err) => {
                    console.log(err);
                });
        });
};

exports.seed = (knex, Promise) => {
    return knex('thumbnails').del()
        .then(() => {
            knex('files').del();
        })
        .then(() => {
            const records = [];
            for (let i = 1; i < 5; i++) {
                records.push(createFile(knex, i));
            }
            return Promise.all(records);
        })
        .catch((err) => {
            console.log(err);
        });
};
