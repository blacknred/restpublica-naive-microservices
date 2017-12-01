const createLike = (knex) => {
    return knex('likes').insert({
        post_id: Math.floor((Math.random() * 60) + 1),
        user_id: Math.floor((Math.random() * 20) + 1)
    });
};

exports.seed = (knex, Promise) => {
    return knex('likes').del()
        .then(() => {
            const records = [];
            for (let i = 1; i < 120; i++) {
                records.push(createLike(knex, i));
            }
            return Promise.all(records);
        })
        .catch((err) => {
            console.log(err);
        });
};
