const request = require('request-promise');

function fetchImageUrl(url) {
    return request({ url, encoding: null })
        .then(buffer => buffer)
        .catch(err => console.log(err));
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
    fetchImageUrl,
    fileToStorage,
    deleteStorageFiles
};
