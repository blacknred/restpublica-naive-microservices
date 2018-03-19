const CronJob = require('cron').CronJob;
const debug = require('debug')('gateway:CRON');
const conf = require('../conf');

// TODO: log stream to Logger microservise
const log = status => debug('Service discovery: %s', status);

module.exports = new CronJob({
    cronTime: '60 * * * * *',
    onTick: async () => {
        /*
        TODO:
        - launched microservices register self hosts and ports in redis
        - gateway gets conf from redis
        - ?every 10 min calls 'ping' all microservices and then updates hosts
        */
        try {
            // mocking
            const version = '/v1';
            conf.USERS_API = process.env.USERS_API_HOST + version;
            conf.COMMUNITIES_API = process.env.COMMUNITIES_API_HOST + version;
            conf.POSTS_API = process.env.POSTS_API_HOST + version;
            conf.PARTNERS_API = process.env.PARTNERS_API_HOST + version;
            log('success');
        } catch (err) {
            log(`failed with ${err.message}`);
        }
    },
    onComplete: () => log('stopped'),
    start: true,
    timeZone: 'Europe/Minsk'
});

