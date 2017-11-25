const getThumb = require('video-thumbnail-url');
const sharp = require('sharp');

const videoThumbler = require('video-thumb');

function saveFile(file) {
    const fileName = file.name;
    const filePath = `../../store/files/${fileName}`;

    file.mv(filePath)
        .catch((err) => {
            throw new Error(err);
        });
    // contentObj.content = req.files.content.data
}

function makeThumb(target, type) {
    const thumbName = `thumb_${target.name}`;
    const thumbPath = `../../store/thumbs/${thumbName}`;
    switch (type) {
        case 'videohosting':
            getThumb(target)
                .then(() => {})
                .catch(() => { return null; });
            break;
        case 'image':
            sharp(target)
                .resize(200)
                .toFile(thumbPath)
                .then(() => {})
                .catch(() => { return null; });
            break;
        case 'video':
            videoThumbler.extract(target, thumbPath, '00:00:05', '200x125')
                .catch(() => {
                    return null;
                });
            break;
        default: return null;
    }
    return thumbPath;
}

function createPost(req) {
    const mimeTypes = [
        'text/plain',
        'text/html',
        'image/jpeg',
        'image/png',
        'image/gif',
        'audio/mpeg',
        'audio/mp3',
        'audio/webm',
        'video/mp4',
        'application/octet-stream'
    ];
    const post = {
        user_id: req.user,
        description: null,
        content_type: null,
        file: null,
        thumbnail: null,
        views: 0
    };
    const linkVideoRegex = new RegExp([
        /((?:https?:)?\/\/)?((?:www|m)\.)?/,
        /((?:youtube\.com|youtu.be|player.vimeo.com|vimeo|facebook.com))/,
        /(\/(?:[\w-]+\?v=|embed\/|(.*)\/video\.php\?(?:.*href)[^"]+|video\/|v\/)?)/,
        /([\w-]+|(?:href=)[.*]+)(?:.*?)/
    ].map((r) => { return r.source; }).join(''));
    /* eslint-disable */
    switch (req.params.type) {
        case 'file':
            if (!req.files.file) throw new Error('Incorrect or empty file');
            // check allowed mime-types
            if (!mimeTypes[req.files.content.mimetype]) {
                throw new Error('Incorrect type of file');
            } 
            if ((req.body.description)) {
                post.description = req.body.description;
            } 
            post.content_type = req.files.content.mimetype;
            // save file
            post.file = saveFile(req.files.file);
            // create thumbnail in some cases
            if ((/image\/*/).test(files.content.mimetype)) {
                post.thumbnail = makeThumb(req.files.file, 'image');
            } else if ((/video\/*/).test(files.content.mimetype)) {
                post.thumbnail = makeThumb(req.files.file, 'video');
            }
            break;
        case 'text':
            if (!req.body.text) throw new Error('Incorrect or empty post');
            post.content_type = 'text/html';
            // save text/html
            post.file = saveFile(req.body.text);
            break;
        case 'link':
            if (!req.body.link) throw new Error('Incorrect or empty link');
            post.file = req.body.link;
            if ((/.(png|jpg|gif)$/).test(post.file)) {
                post.thumbnail = makeThumb(req.body.link, 'image');
            }
            if ((linkVideoRegex).test(post.file)) {
                post.thumbnail = makeThumb(req.body.link, 'videohosting');
            }
            if ((req.body.description)) post.description = req.body.description;
            break;
        default: throw new Error('Incorrect or empty type');
    }
    /* eslint-enable */
    return post;
}

module.exports = {
    createPost
};

