const CronJob = require('cron').CronJob;
const debug = require('debug')('gateway');
const adresses = require('../adresses');

// TODO: log stream to Logger microservise
const log = (job, status) => debug('[JSCron]: %s: %s', job, status);

module.exports = new CronJob({
    cronTime: '10 * * * * *',
    onTick: async () => {
        /*
        TODO:
        - launched microservices register self hosts and ports in redis
        - gateway gets adresses from redis
        - ?every 10 min calls 'ping' all microservices and then updates hosts
        */
        try {
            // mocking
            const version = '/v1';
            adresses.users_api = process.env.USERS_API_HOST + version;
            adresses.communities_api = process.env.COMMUNITIES_API_HOST + version;
            adresses.posts_api = process.env.POSTS_API_HOST + version;
            adresses.partners_api = process.env.PARTNERS_API_HOST + version;
            log('Service discovery', 'success');
        } catch (err) {
            log('Service discovery', `failed with ${err.message}`);
        }
    },
    onComplete: () => log('Service discovery', 'stopped'),
    start: true,
    timeZone: 'America/Los_Angeles'
});

// client.on('ready', async () => {
//     const keys = await client.keysAsync('*');
//     debug('[Redis]: keys count %s', keys.length);
//     keys.forEach(async (key) => {
//         debug('[Redis]: %s - %s', key, await client.getAsync(key));
//     });
// });
// client.on('error', async (err) => {
