const createLike = (knex) => {
    return knex('likes').insert({
        post_id: Math.floor((Math.random() * 100) + 1),
        user_id: Math.floor((Math.random() * 20) + 1)
    });
};

exports.seed = (knex, Promise) => {
    return knex('likes').del()
        .then(() => {
            const records = [];
            for (let i = 1; i < 1000; i++) {
                records.push(createLike(knex, i));
            }
            return Promise.all(records);
        })
        .catch((err) => {
            console.log(err);
        });
};
