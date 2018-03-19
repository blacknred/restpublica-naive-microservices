const CronJob = require('cron').CronJob;
const debug = require('debug')('gateway:CRON');
const { request } = require('../routes/_helpers');
const hosts = require('../conf');

// TODO: log stream to Logger microservise
const log = status => debug('Deleting inactive users and communities: %s', status);

module.exports = new CronJob({
    cronTime: '00 60 * * * *',
    onTick: async () => {
        /*
        When user tries to delete self profile or community, their active status
        is changed to false and all dependencies like subscriptions in users or
        subscriptions and bans in communities are deleted. There is available
        recovery time: 3 month for users and 1 month for communities. Thus if
        last activity was earlier, system deletes inactive instances.
        */
        try {
            const ctx = {
                method: 'DELETE',
                state: {
                    consumer: 0,
                    body: {}
                }
            };
            const dUsers = await request(ctx, hosts.USERS_API, '/users', true);
            const dComms = await request(ctx, hosts.COMMUNITIES_API, '/communities', true);
            console.log(dUsers.data);
            console.log(dComms.data);
            // delete ctx.state.method;
            // delete communities where user is admin, related subscriptions and bans
            // delete user posts, likes, comments
            // if posts have relation on removed communities set community_id val null
            log('success');
        } catch (err) {
            log(`failed with ${err.message}`);
        }
    },
    onComplete: () => log('stopped'),
    start: false,
    timeZone: 'America/Los_Angeles'
});
