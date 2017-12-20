/* eslint-disable no-unused-vars */
const sharp = require('sharp');
const fetch = require('node-fetch');
const request = require('request-promise');
const fs = require('fs');
const path = require('path');

const imgSrc = 'https://placeimg.com/640/480/any';
const imgSrc2 = 'http://lorempixel.com/640/480/';
const dir = path.join(__dirname, 'static');
const fetchFromDir = true;
const fetchedImgs = [];

/* fake dir fs populating */
const fsReadFile = async (file) => {
    const p = path.join(dir, file);
    const buff = await fs.readFileSync(p);
    await fetchedImgs.push(buff);
};
const fsReadAllFilesFromDir = async () => {
    const promises = [];
    await fs.readdir(dir, (err, files) => {
        if (err) console.log(err);
        for (let i = 0; i < files.length; i++) {
            promises.push(fsReadFile(files[i]));
            if (i === (files.length - 1)) break;
        }
        return Promise.all(promises);
    });
};
/* fake dir fs populating */


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
    // console.log(imgBuffer.length);
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
            if (fetchFromDir) {
                fsReadAllFilesFromDir()
                    .then((h) => {
                        return h;
                    });
            }
            const fetches = [];
            for (let i = 1; i <= 500; i++) {
                fetches.push(fet(imgSrc2));
            }
            return Promise.all(fetches);
        })
        .then(() => {
            const filesCount = fetchedImgs.length;
            console.log(`all fetched files count: ${filesCount}`);
            const records = [];
            for (let i = 1; i < filesCount; i++) {
                // const postId = Math.floor((Math.random() * 250) + 1);
                records.push(createFile(knex, i, fetchedImgs[i]));
            }
            return Promise.all(records);
        })
        .catch((err) => {
            console.log(err);
        });
};
