/* eslint-disable no-unused-vars */

const fs = require('fs');
const path = require('path');
const util = require('util');
const request = require('request-promise');

const fetchedImgs = [];
const IMG_COUNT = 500;

const FETCH_FROM_DIR = false;
const DIR = path.join(__dirname, 'static');

const STORAGE = `http://files-storage:3007?seedFrom=${process.env.NODE_ENV}`;
const IMG_SIZES = ['600x600', '600x700', '600x800'];
const IMG_COLLECTIONS = ['1111575', '582659', '494266'];
const IMG_SRC = 'https://source.unsplash.com/collection';

/* fake DIR fs populating */
const fsReadDir = async () => {
    const readdir = util.promisify(fs.readdir);
    try {
        const files = await readdir(DIR);
        files.forEach(async (file) => {
            const p = path.join(DIR, file);
            const buffer = await fs.readFileSync(p);
            fetchedImgs.push(buffer);
        });
    } catch (err) {
        console.log(err.message);
    }
};

/* fake url populating */
const fetchImg = () => {
    const conf = {
        url: `${IMG_SRC}/` +
            `${IMG_COLLECTIONS[Math.floor(Math.random() * IMG_COLLECTIONS.length)]}/` +
            `${IMG_SIZES[Math.floor(Math.random() * IMG_SIZES.length)]}/` +
            `?sig=${Math.floor(Math.random() * IMG_COUNT)}`,
        encoding: null,
        resolveWithFullResponse: true
    };
    return request(conf)
        .then((res) => {
            // console.log(conf.url, res.body.length);
            fetchedImgs.push(res.body);
            return null;
        })
        .catch((err) => {
            console.log(err.message);
        });
};

const createFile = (knex, i, imgBuffer) => {
    const conf = {
        method: 'POST',
        uri: STORAGE,
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
                    fetches.push(fetchImg());
                }
                return Promise.all(fetches);
            }
            if (FETCH_FROM_DIR) return fsReadDir();
            const fetches = [];
            for (let i = 1; i <= IMG_COUNT; i++) {
                fetches.push(fetchImg());
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
