import React, { Component } from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard';

import CircularProgress from 'material-ui/CircularProgress';

class PostList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            posts: []
        }
    }

    getPosts(mode) {
        const options = {
            url: `http://localhost:3002/api/v1/posts/${mode}`,
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${window.localStorage.authToken}`
            }
        };
        return axios(options)
            .then((res) => {
                this.setState({ posts: res.data.data });
            })
            .catch((err) => { console.log(err); })
    }
    componentDidMount() {
        // this.getPosts(this.props.mode)
    }
    render() {
        return (
            <div className="posts">
                {
                    this.state.posts.length
                        ? this.state.posts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                            />))
                        : <CircularProgress />
                }
            </div>
        )
    }
}

export default PostList;
