const redis = require('redis');
const bluebird = require('bluebird');
const CronJob = require('cron').CronJob;
const debug = require('debug')('gateway:JSCRON-Redis');

const client = redis.createClient(6379, 'redis-cache');
client.auth(process.env.REDIS_PASSWORD);
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

// TODO: log stream to Logger microservise

client.on('ready', () => debug('ready'));
client.on('error', err => debug(`error: ${err.message}`));


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
            debug(`logging failed with ${err.message}`);
        }
    },
    onComplete: () => debug('logging stopped'),
    start: true,
    timeZone: 'Europe/Minsk'
});

