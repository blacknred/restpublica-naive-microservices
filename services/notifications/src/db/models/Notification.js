const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// limit: {
    //     type: Number,
    //     min: 50,
    //     index: true,
    //     unique: true,
    //     required: true
    // },
    // planId: {
    //     type: Number,
    //     required: true,
    //     index: true,
    //     ref: 'ApiPlan'
    // },
    // adminId: {
    //     type: Number,
    //     required: true,
    //     index: true
    // },
    // domain: {
    //     type: String,
    //     unique: true,
    //     lowercase: true,
    //     trim: true,
    //     required: true,
    //     match: /[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/
    // },
    // email: {
    //     type: String,
    //     lowercase: true,
    //     trim: true,
    //     required: true,
    //     // eslint-disable-next-line
    //     match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    //         'Please fill a valid email address']
    // },

const Notification = new Schema({
    type: {
        type: String,
        enum: [
            'USER_CREATE_SUBSCRIPTION', // `origin` subscribed to you --- origin username, avatar
            'USER_DELETE_SUBSCRIPTION', // `origin` unsubscribed from you --- origin username, avatar
            'COMMUNITY_APPROVE_MEMBERSHIP', // `community` approved your membership --- community name, avatar
            'COMMUNITY_REJECT_MEMBERSHIP', // `community` rejected your membership --- community name, avatar
            'COMMUNITY_APPROVE_POST', // `community` published your post --- community name, avatar, post link, thumb?
            'COMMUNITY_REJECT_POST', // `community` reject your post --- community name, avatar, post link, thumb?
            'COMMUNITY_START_BAN', // You are banned from `community` --- community name, avatar,
            'COMMUNITY_END_BAN', // Your ban from `community` ended --- community name, avatar,
            'POST_LIKE', // `origin` liked you post --- origin username, avatar, post link, thumb?
            'POST_COMMENT', // `origin` commented your post --- origin username, avatar, post link, thumb?
            'POST_COMMENT_LIKE', // `origin` liked you comment --- origin username, avatar, comment link, thumb?
            'POST_REPOST', // `origin` repost your post --- origin username, avatar, post link, thumb?
            'POLL_FINISHED' // `poll` was finished at `createdAt` --- poll link, thumb?
        ],
        default: 'USER_CREATE_SUBSCRIPTION'
    },
    originId: {
        type: Number,
        required: true,
        index: true
    },
    targetId: {
        type: Number,
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Notification', Notification);

