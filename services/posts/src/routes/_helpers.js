const request = require('request-promise');

const deleteStorageFiles = async (urls) => {
    await Promise.all(urls.map(url => request.delete(url)));
};

module.exports = {
    deleteStorageFiles,
};
