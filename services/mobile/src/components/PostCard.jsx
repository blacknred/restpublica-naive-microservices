import React from 'react';
import { Link } from 'react-router-dom';

import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import ActionFavoriteIcon from 'material-ui/svg-icons/action/favorite';
import CommunicationCommentIcon from 'material-ui/svg-icons/communication/comment';
import ImageRemoveRedEyeIcon from 'material-ui/svg-icons/image/remove-red-eye';

const MovieCard = (props) => {
    const post = props.post
    return (
        <Card className='post-card'>
            <Link to={`/u/${post.username}`}>
                <CardHeader
                    title={
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <span>{post.username}</span>
                            <span>{post.created_at}</span>
                        </div>
                    }
                    subtitle="Subtitle"
                    avatar={`data:image/png;base64, ${post.avatar}`}
                /></Link>
            <CardMedia>
                <Link to={{ pathname: `/p/${post.post_id}`, state: { modal: true } }}>
                    <img src={post.thumbnail} alt="" />
                </Link>
            </CardMedia>
            <CardText>
                {post.description}
                <div>
                    <ActionFavoriteIcon />
                    <CommunicationCommentIcon />
                    <ImageRemoveRedEyeIcon />
                </div>
            </CardText>
            <CardActions>
                {post.likes}<ActionFavoriteIcon />
                {post.comments}<CommunicationCommentIcon />
                {post.views}<ImageRemoveRedEyeIcon />
            </CardActions>
        </Card>
    )
}

export default MovieCard;
