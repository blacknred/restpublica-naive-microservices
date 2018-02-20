const sharp = require('sharp');
const request = require('request-promise');
const ffmpeg = require('fluent-ffmpeg');


function imageToJpg(imageBuffer) {
    sharp(imageBuffer)
        .jpeg()
        .toBuffer()
        .then(buffer => buffer)
        .catch(err => err);
}

function videoToMp4(videoBuffer) {
    return ffmpeg(videoBuffer).format('mp4');
}

function fetchImageUrl(url) {
    return request({ url, encoding: null })
        .then(buffer => buffer)
        .catch(err => console.log(err));
}

function imageThumb(imageBuffer) {
    sharp(imageBuffer)
        .resize(300, null)
        .toBuffer()
        .then(buffer => buffer)
        .catch(err => err);
}

function videoThumb(videoBuffer) {
    ffmpeg(videoBuffer)
        .screenshots({
            count: 1,
            size: '320x240'
        });
}

function fileToStorage(name, mime, fileBuffer, thumbBuffer) {
    const options = {
        method: 'POST',
        uri: process.env.FILES_STORAGE_HOST,
        formData: {
            file: {
                value: fileBuffer,
                options: {
                    filename: name,
                    contentType: mime
                }
            },
            thumb: {
                value: thumbBuffer,
                options: {
                    filename: `thumb_${name}`,
                    contentType: mime
                }
            }
        }
    };
    return request(options)
        .then(data => JSON.parse(data))
        .catch(err => console.log(err));
}

function deleteStorageFiles(paths) {
    paths.forEach((path) => {
        return request.delete(path)
            .catch(err => console.log(err));
    });
}

module.exports = {
    imageToJpg,
    videoToMp4,
    fetchImageUrl,
    imageThumb,
    videoThumb,
    fileToStorage,
    deleteStorageFiles
};
