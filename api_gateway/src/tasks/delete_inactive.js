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
                headers: { ['user-agent']: '' }, // eslint-disable-line
                state: { consumer: 0, body: {} }
            };
            const [deletedUsers, deletedCommunities] = await Promise.all([
                request(ctx, hosts.USERS_API, '/users', true),
                request(ctx, hosts.COMMUNITIES_API, '/communities', true)
            ]);
            console.log(deletedUsers, deletedCommunities);
            if (deletedUsers.data) {
                console.log(deletedUsers.data);
                deletedUsers.data.forEach(async (user) => {
                    // get communities where users are admins
                    ctx.method = 'GET';
                    const communities = await request(ctx, hosts.COMMUNITIES_API,
                        `/communities?admin=${user.id}`, true);
                    // update their active value to false
                    ctx.method = 'PUT';
                    ctx.state.consumer = user.id;
                    ctx.state.body = { active: false };
                    await Promise.all([
                        communities.data.communities.map(com => request(ctx,
                            hosts.COMMUNITIES_API, `/communities/${com.id}`, true))
                    ]);
                    // TODO: delete users related community's subscriptions
                    // TODO: delete users posts, likes, comments
                });
            }
            if (deletedCommunities.data) {
                console.log(deletedCommunities.data);
                // TODO: if posts has relation on removed communities set community_id to null
            }
            delete ctx.state.method;
            log('success');
        } catch (err) {
            log(`failed with ${err.message}`);
        }
    },
    onComplete: () => log('stopped'),
    start: false,
    timeZone: 'America/Los_Angeles'
});
