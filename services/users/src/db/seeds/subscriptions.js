const createSubscription = (knex, id, subId) => {
    return knex('subscriptions').insert({
        user_id: id,
        sub_user_id: subId
    });
};

exports.seed = (knex, Promise) => {
    return knex('subscriptions').del()
        .then(() => {
            const records = [];
            for (let i = 1; i < 10; i++) {
                for (let y = i + 1; y < 10; y++) {
                    records.push(createSubscription(knex, i, y));
                }
            }
            return Promise.all(records);
        })
        .catch((err) => { console.log(err); }); // eslint-disable-line
};
