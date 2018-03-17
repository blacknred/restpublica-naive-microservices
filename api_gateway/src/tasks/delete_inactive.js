const CronJob = require('cron').CronJob;
const debug = require('debug')('gateway');
const { request } = require('../routes/_helpers');
const hosts = require('../adresses');

// TODO: log stream to Logger microservise
const log = (job, status) => debug('[JSCron]: %s: %s', job, status);

module.exports = new CronJob({
    cronTime: '15 * * * * *',
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
            await request(ctx, hosts.users_api, '/users', true);
            await request(ctx, hosts.communities_api, '/communities', true);
            // delete ctx.state.method;
            // delete communities where user is admin, related subscriptions and bans
            // delete user posts, likes, comments
            // if posts have relation on removed communities set community_id val null
            log('Deleting inactive users & communities', 'success');
        } catch (err) {
            log('Deleting inactive users and communities', `failed with ${err.message}`);
        }
    },
    onComplete: () => log('Deleting inactive users and communities', 'stopped'),
    start: false,
    timeZone: 'America/Los_Angeles'
});
