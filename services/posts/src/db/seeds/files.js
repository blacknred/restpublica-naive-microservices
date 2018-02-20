/* eslint-disable no-unused-vars */
const sharp = require('sharp');
const request = require('request-promise');
const fs = require('fs');
const path = require('path');
const util = require('util');

const fetchFromDir = true;
const dir = path.join(__dirname, 'static');
const imgSrc = 'http://lorempixel.com/640/480/';
const fetchedImgs = [];

/* fake dir fs populating */
const fsReadDir = async () => {
    const readdir = util.promisify(fs.readdir);
    try {
        const files = await readdir(dir);
        files.forEach(async (file) => {
            const p = path.join(dir, file);
            const buffer = await fs.readFileSync(p);
            // console.log(`fetched file length: ${buffer.length}`);
            fetchedImgs.push(buffer);
        });
    } catch (error) {
        console.log(error.message);
    }
};

/* fake url populating */
const fetchImg = (image) => {
    return request(image)
        .then(res => res.buffer())
        .then((buffer) => {
            // console.log(`fetched file length: ${buffer.length}`);
            fetchedImgs.push(buffer);
            return null;
        })
        .catch(err => console.log(err));
};

const createFile = (knex, i, imgBuffer) => {
    return sharp(imgBuffer)
        .resize(200, null)
        .toBuffer()
        .then((thumbBuffer) => {
            const fileOptions = {
                method: 'POST',
                uri: process.env.FILES_STORAGE_HOST,
                formData: {
                    file: {
                        value: imgBuffer,
                        options: {
                            filename: `file_${i}.jpg`,
                            contentType: 'image/jpg'
                        }
                    },
                    thumb: {
                        value: thumbBuffer,
                        options: {
                            filename: `thumb_${i}.jpg`,
                            contentType: 'image/jpg'
                        }
                    }
                }
            };
            return request(fileOptions)
                .then((data) => {
                    const datas = JSON.parse(data);
                    const [file, thumb] = datas;
                    return knex('post_files')
                        .insert({
                            post_id: i,
                            mime: 'image/jpg',
                            file: file.url,
                            thumb: thumb.url
                        });
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
};

exports.seed = (knex, Promise) => {
    return knex('files')
        .del()
        .then(() => {
            if (fetchFromDir) {
                return fsReadDir();
            }
            const fetches = [];
            for (let i = 1; i <= 500; i++) {
                fetches.push(fetchImg(imgSrc));
            }
            return Promise.all(fetches);
        })
        .then(() => {
            console.log(`all fetched files count: ${fetchedImgs.length}`);
            const records = [];
            fetchedImgs.forEach((img, i) => records.push(createFile(knex, i + 1, img)));
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
