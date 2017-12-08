/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
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
        const headers = {
            headers: { 'Content-Type': 'application/json' }
        }
        if (window.localStorage.authToken) {
            headers.headers.Authorization = `Bearer ${window.localStorage.authToken}`;
        };
        return axios.get(`http://localhost:3002/api/v1/posts/${mode}`, headers)
            .then((res) => {
                console.log(res)
                this.setState({ posts: res.data.data });
            })
            .catch((err) => { console.log(err); })
    }
    componentDidMount() {
        console.log('dashboard mounted')
        this.getPosts(this.props.mode)
    }
    render() {
        return (
            <div className='container'>
                <div className="posts">
                    {
                        this.state.posts.length
                            ? this.state.posts.map(post => (
                                <PostCard
                                    key={post.post_id}
                                    post={post}
                                />))
                            : <CircularProgress />
                    }
                </div>
            </div>
        )
    }
}

export default PostList;
