const path = require('path');
const debug = require('debug')('gateway');
const fs = require('fs');

/* Js cron */

module.exports = () => {
    if (process.env.NODE_ENV !== 'production') {
        const tasks = fs.readdirSync(path.join(__dirname, 'tasks'));
        debug('[JSCron] started! Running jobs:');
        tasks.forEach((task) => {
            const y = require(`./tasks/${task}`); // eslint-disable-line
            try {
                y.start();
                console.log('%s status is %s', task, y.running);
            } catch (err) {
                debug('[JSCron] error! %s', err.message);
            }
        });
    }
};

