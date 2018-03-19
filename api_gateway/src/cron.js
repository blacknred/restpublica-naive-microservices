const path = require('path');
const debug = require('debug')('gateway:CRON');
const fs = require('fs');

/* Js cron */

module.exports = () => {
    if (process.env.NODE_ENV !== 'production') {
        const tasks = fs.readdirSync(path.join(__dirname, 'tasks'));
        debug('started! Running jobs:');
        tasks.forEach((task) => {
            const y = require(`./tasks/${task}`); // eslint-disable-line
            try {
                y.start();
                console.log('%s status is %s', task, y.running);
            } catch (err) {
                debug('error! %s', err.message);
            }
        });
    }
};

