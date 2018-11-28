const debug = require('debug')('notifications-api:mongoose');
const mongoose = require('mongoose');

const DB_URI = process.env.NODE_ENV !== 'test' ?
    process.env.DATABASE_URL : process.env.DATABASE_URL_TEST;
mongoose.Promise = Promise;
mongoose.connect(DB_URI);

const Notification = require('./models/Notification');

const db = mongoose.connection;

/* db setup */

module.exports = async () => {
    await Notification.collection.drop();
    db.on('error', err => console.log(err));
    db.on('open', () => {
        debug(`Connected to Database: ${DB_URI}`);
        // seeds if needed
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line global-require
            require('./seeds/notifications')();
        }
    });
};
