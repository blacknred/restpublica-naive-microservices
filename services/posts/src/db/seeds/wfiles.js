const sharp = require('sharp');
const fetch = require('node-fetch');
const request = require('request-promise');
// const faker = require('faker'); // faker.image.image();
const imgSrc = 'https://placeimg.com/640/480/any';
const fetchedImgs = [];

const fet = (image) => {
    return fetch(image)
        .then((res) => {
            return res.buffer();
        })
        .then((buffer) => {
            console.log(`fetched file length: ${buffer.length}`);
            fetchedImgs.push(buffer);
            return null;
        })
        .catch(() => {
            return null;
        });
};

const createFile = (knex, i, imgBuffer) => {
    return sharp(imgBuffer)
        .resize(200)
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
                            post_id: i,
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
                            post_id: i,
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
};

exports.seed = (knex, Promise) => {
    return knex('thumbnails')
        .del()
        .then(() => {
            knex('files').del();
        })
        .then(() => {
            const fetches = [];
            for (let i = 1; i <= 250; i++) {
                fetches.push(fet(imgSrc));
            }
            return Promise.all(fetches);
        })
        .then(() => {
            const filesCount = fetchedImgs.length;
            console.log(`all fetched files count: ${filesCount}`);
            const records = [];
            for (let i = 1; i <= filesCount; i++) {
                // const postId = Math.floor((Math.random() * 250) + 1);
                records.push(createFile(knex, i, fetchedImgs[i]));
            }
            return Promise.all(records);
        })
        .catch((err) => {
            console.log(err);
        });
};
