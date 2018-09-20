/* eslint-disable no-throw-literal */

function notificationsValidation(req, res, next) {
    if (req.method === 'POST') {
        req.checkBody('type')
            .isIn([
                'USER_CREATE_SUBSCRIPTION',
                'USER_DELETE_SUBSCRIPTION',
                'COMMUNITY_REJECT_MEMBERSHIP',
                'COMMUNITY_APPROVE_MEMBERSHIP',
                'COMMUNITY_APPROVE_POST',
                'COMMUNITY_REJECT_POST',
                'COMMUNITY_START_BAN',
                'COMMUNITY_END_BAN',
                'POST_LIKE',
                'POST_COMMENT',
                'POST_COMMENT_LIKE',
                'POST_REPOST',
                'POLL_FINISHED'
            ])
            .withMessage('Invalid notification type');
        req.checkBody('originId').isInt().withMessage(`Origin id must be integer`);
    } else if (req.method === 'DELETE') {
        req.checkParams('nid').matches(/^[a-f\d]{24}$/i)
            .withMessage('Notification id must be valid');
    }
    const failures = req.validationErrors();
    if (failures) throw { status: 422, message: failures };
    return next();
}

module.exports = {
    notificationsValidation,
};
