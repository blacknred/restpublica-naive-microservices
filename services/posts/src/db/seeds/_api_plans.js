const createPlan = (knex, plan) => {
    return knex('api_plans')
        .insert(plan)
        .catch(err => console.log(err));
};

exports.seed = (knex) => {
    return knex('api_plans')
        .del()
        .then(() => {
            const plans = [
                {
                    name: 'light',
                    limit_per_hour: 10,
                    price: 0
                },
                {
                    name: 'medium',
                    limit_per_hour: 100,
                    price: 0
                },
                {
                    name: 'unlimited',
                    limit_per_hour: 10000,
                    price: 0
                }
            ];
            const records = [];
            plans.forEach(plan => records.push(createPlan(knex, plan)));
            return Promise.all(records);
        })
        .catch(err => console.log(err));
};
