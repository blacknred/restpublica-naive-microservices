const CronJob = require('cron').CronJob;
const debug = require('debug')('gateway:JSCRON-Service discovery');

const conf = require('../conf');

// TODO: log stream to Logger microservise

module.exports = new CronJob({
    cronTime: '60 * * * * *',
    onTick: async () => {
        /*
        TODO:
        - launched microservices register self hosts and ports in redis
        - gateway gets conf from redis? every 10 min
        */
        try {
            // mocking
            const version = '/v1';
            conf.USERS_API = `http://users-service:3004${version}`;
            conf.COMMUNITIES_API = `http://communities-service:3005${version}`;
            conf.POSTS_API = `http://posts-service:3006${version}`;
            conf.PARTNERS_API = `http://partners-service:3008${version}`;
            conf.NOTIFICATIONS_API = `http://notifications-service:3009${version}`;
            conf.STORAGE = 'http://files-storage:3007';
            debug('success');
        } catch (err) {
            debug(`failed with ${err.message}`);
        }
    },
    onComplete: () => debug('stopped'),
    start: true,
    timeZone: 'Europe/Minsk'
});
