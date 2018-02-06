const createPartner = (knex) => {
    return knex('api_partners')
        .insert({
            api_key: Math.random().toString(36).slice(2),
            api_plan_id: Math.floor(Math.random() * 3) + 1,
        })
        .catch(err => console.log(err));
};
exports.seed = (knex, Promise) => {
    return knex('api_partners')
        .del()
        .then(() => {
            const records = [];
            for (let i = 1; i < 10; i++) {
                records.push(createPartner(knex, i));
            }
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
