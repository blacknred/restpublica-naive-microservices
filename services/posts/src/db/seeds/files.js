/* eslint-disable no-unused-vars */

const fs = require('fs');
const path = require('path');
const util = require('util');
const request = require('request-promise');

const STORAGE_HOST = 'http://files-storage:3007';
const FETCH_FROM_DIR = true;
const DIR = path.join(__dirname, 'static');
const IMG_SRC = 'http://lorempixel.com/640/480/';
const fetchedImgs = [];

/* fake DIR fs populating */
const fsReadDir = async () => {
    const readdir = util.promisify(fs.readdir);
    try {
        const files = await readdir(DIR);
        files.forEach(async (file) => {
            const p = path.join(DIR, file);
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
    const conf = {
        method: 'POST',
        uri: STORAGE_HOST,
        formData: {
            file: {
                value: imgBuffer,
                options: {
                    filename: `file${imgBuffer.length}.jpg`,
                    contentType: 'image/jpg'
                }
            },
        },
        json: true
    };
    return request(conf)
        .then((data) => {
            console.log(data.data[0].file);
            return knex('files')
                .insert({
                    post_id: i,
                    mime: 'image/jpg',
                    file: data.data[0].file,
                    thumb: data.data[0].thumb
                });
        })
        .catch(err => console.log(''));
};

exports.seed = (knex, Promise) => {
    return knex('files')
        .del()
        .then(() => {
            if (process.env.NODE_ENV === 'test') {
                const fetches = [];
                for (let i = 1; i <= 10; i++) {
                    fetches.push(fetchImg(IMG_SRC));
                }
                return Promise.all(fetches);
            }
            if (FETCH_FROM_DIR) return fsReadDir();
            const fetches = [];
            for (let i = 1; i <= 2; i++) {
                fetches.push(fetchImg(IMG_SRC));
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
