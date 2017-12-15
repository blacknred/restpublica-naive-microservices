import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment'

import { Card, CardMedia, CardTitle } from 'material-ui/Card';
// import { Card, CardActions, CardHeader, CardMedia, CardText, CardTitle } from 'material-ui/Card';
// import ActionFavoriteIcon from 'material-ui/svg-icons/action/favorite';
// import CommunicationCommentIcon from 'material-ui/svg-icons/communication/comment';
// import ImageRemoveRedEyeIcon from 'material-ui/svg-icons/image/remove-red-eye';

const styles = {
    card: {
        width: '19%', margin: '0.3em', background: 'inherit', boxShadow: 'null'
    },
    cardTitle: {
        padding: '16px 16px 16px 0'
    },
    cardTitleTitle: {
        fontSize: '0.9em', fontWeight: 'bold'
    },
    cardTitleSubtitleCounts: {
        display: 'flex', justifyContent: 'space-between'
    }
}

let countDate = (dateObj => {
    let date = moment.parseZone(dateObj)
    let now = moment().parseZone()
    let res
    if (now.year() > date.year()) res = `${now.year() - date.year()} year`
    else if (now.month() > date.month()) res = `${now.month() - date.month()} month`
    else if (now.date() > date.date() + 7) res = `${(now.date() - date.date()) / 7} week`
    else if (now.date() > date.date()) res = `${now.date() - date.date()} day`
    else if (now.hour() > date.hour()) res = `${date.hour()} hour`
    else if (now.minute() > date.minute()) res = `${date.minute()} min`
    else res = `${date.secounds} sec`
    // else if (date.isoWeek() === now.isoWeek()) res = date.weekday()
    return res
})

const PostCard = (props) => {
    const post = props.post
    return (
        <Card style={styles.card}>
            {/* <Link to={`/u/${post.author.username}`}>
                <CardHeader
                    title={post.author.username}
                    subtitle={post.author.subscription_id ? '  unfollow' : '  follow'}
                    avatar={`data:image/png;base64, ${post.author.avatar}`}
                    <span>{countDate(post.created_at)}</span>
                />
            </Link> */}

            <CardMedia>
                <Link to={{ pathname: `/p/${post.post_id}`, state: { modal: true } }}>
                    <div>
                        {
                            post.thumbs.map((thumb, i) => {
                                return <img
                                    src={`http://${thumb.url}`}
                                    key={i} alt="" width='100%' />
                            })
                        }
                    </div>
                </Link>
            </CardMedia>

            <CardTitle
                style={styles.cardTitle}
                title={post.description}
                titleStyle={styles.cardTitleTitle}
                subtitle={
                    <div>
                        <div>
                            <Link to={`/u/${post.author.username}`}>
                                <b>{post.author.username}</b>
                            </Link>
                            {/* <span>{countDate(post.created_at)}</span> */}
                        </div>
                        <br />
                        <div style={styles.cardTitleSubtitleCounts} >
                            <span>{`${post.views} views ${post.likes_count} likes`}</span>
                            <span>{countDate(post.created_at)}</span>
                        </div>
                    </div>
                }
            />

            {/* <CardActions style={{ color: 'grey', fontSize: '0.7em' }}>
                <span>
                    <ActionFavoriteIcon style={{ width: '16px' }} >{post.likes_count} </ActionFavoriteIcon>
                    <CommunicationCommentIcon style={{ width: '16px' }} />{post.comments_count}
                    <ImageRemoveRedEyeIcon style={{ width: '16px' }} />{post.views}
                </span>
            </CardActions> */}
        </Card>
    )
}

export default PostCard;
