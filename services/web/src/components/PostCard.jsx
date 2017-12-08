import React from 'react';
import { Link } from 'react-router-dom';

import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

const MovieCard = (props) => {
    const post = props.post
    return (
        <Card className='post-card'>
            <CardHeader
                title={<Link to={`/u/${post.username}`}>{post.username}</Link>}
                subtitle="Subtitle"
                avatar={`data:image/png;base64, ${post.avatar}`}
            />
            <CardMedia>
                <Link to={{ pathname: `/p/${post.post_id}`, state: { modal: true } }}>
                    <img src={post.thumbnail} alt="" />
                </Link>
            </CardMedia>
            <CardText>{post.description}</CardText>
            <CardActions>
                <FlatButton label="Action1" />
                <FlatButton label="Action2" />
            </CardActions>
        </Card>
    )
}

export default MovieCard;
