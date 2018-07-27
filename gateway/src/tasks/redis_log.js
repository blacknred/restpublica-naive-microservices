const CronJob = require('cron').CronJob;
const debug = require('debug')('gateway:CRON');
const redis = require('redis');
const bluebird = require('bluebird');

const client = redis.createClient(6379, 'redis-cache');
client.auth(process.env.REDIS_PASSWORD);
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

// TODO: log stream to Logger microservise
const log = status => debug('Redis: %s', status);

client.on('ready', () => log('ready'));
client.on('error', err => log(`error: ${err.message}`));


module.exports = new CronJob({
    cronTime: '10 * * * * *',
    onTick: async () => {
        try {
            // const keys = await client.keysAsync('*');
            // log(`\n ${keys.length} keys:`);
            // keys.forEach(async (key) => {
            //     console.log(' %s - %s', key, await client.getAsync(key));
            // });
        } catch (err) {
            log(`logging failed with ${err.message}`);
        }
    },
    onComplete: () => log('logging stopped'),
    start: true,
    timeZone: 'Europe/Minsk'
});

