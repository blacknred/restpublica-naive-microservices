## Partner api microservice (client) - localhost:3008
    - / (index page links to register, docs and console)
    - /register (available after user auth)
        -> app name
        -> app domain
        -> contact e-mail
        -> api_plan
        <- consumer key, consumer secret
    - /docs (api docs ?swagger)
    - /console (test api calls, need consumer key and secret)




//     /*
//     users ids from:
//     users where i follow and communities i follow
//     sort by 'last_post_at'
//     2 requests
//     */
//     /*
//     posts where user_id in UsersArr orWhere community_id in CommsArr
//     sort by created_at
//     */


//     // -> authors -> posts by authors
//     const offset = req.query.offset && /^\+?\d+$/.test(req.query.offset)
//         ? --req.query.offset : 0;
//     return helpers.getFollowing(req)
//         .then((following) => {
//             if (!following) throw new Error(`User has no following users`);
//             return postsQueries.getDashboardPosts(
//                 following.map(sub => sub.user_id), offset
//             );
//         })
//         .then((data) => {
//             if (data.name) throw new Error(data.detail || data.message);
//             return Promise.all([
//                 data,
//                 helpers.getUsersData(data.posts.map(u => u.user_id))
//             ]);
//         })
//         .then((arrs) => {
//             const [data, users] = arrs;
//             if (data.count > 0 && !users) throw new Error(`Users data not fetched`);
//             // eslint-disable-next-line
//             data.posts.forEach(x => x.author = users.find(y => y.user_id == x.user_id));
//             res.status(200).json({
//                 status: 'success',
//                 data
//             });
//         })
//         .catch((err) => {
//             res.status(500).json({
//                 status: 'error',
//                 message: err.message
//             });
//         });
// });

/*
Select id
From Users
joinLeft users_subscriptions on user_subscriptions.user_id = users.id
joinLeft comm_subscriptions on com_subscriptions.user_id = users.id
Where users_subscriptions.sub_user.id = req.user
orWhere

------------------------------------------------------------------
1.
Select id
From Communities
joinLeft comm_subscriptions on com_subscriptions.com_id = comms.id
Where user_id = req.user
SortBy comms.last_post_at Desc
Limit 20 Offset offset
--> authors: 23,45,12,22..

2.
Select id
From Users
joinLeft users_subscriptions on user_subscriptions.user_id = users.id
Where users_subscriptions.sub_user.id = req.user
SortBy users.last_post_at Desc
Limit 20 Offset offset
--> communities: 23,45,12,22..

3.
<--authors, communities
Select distinct id
From Posts
Where author_id in authors
orWhere communities_id in communities
SortBy users.last_post_at Desc
Limit 20 Offset offset

--> status {next_res_offset 1, next_posts_offset: 2 }, count{}, posts{}

*/
