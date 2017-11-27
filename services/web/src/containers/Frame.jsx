import React, { Component } from 'react';
import axios from 'axios';

import PostList from '../components/PostList';
import Header from './Header';

class Frame extends Component {
    constructor(props) {
        super(props);
        this.state = {
            posts: []
        }
        this.saveNewPost = this.saveNewPost.bind(this)
        this.getPosts = this.getPosts.bind(this)
        this.getCurrentUser = this.getCurrentUser.bind(this)
    }
    saveNewPost(movie) {
        const options = {
            url: 'http://localhost:3002/posts/dashboard',
            method: 'post',
            data: {
                title: movie
            },
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${window.localStorage.authToken}`
            }
        };
        return axios(options)
            .then((res) => { this.getPosts() })
            .catch((error) => { console.log(error); })
    }
    getPosts() {
        const options = {
            url: 'http://localhost:3002/posts/dashboard',
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
    getCurrentUser() {
        return window.localStorage.user
    }
    render() {
        return (
            <div>
                <Header 
                    logoutUser={this.props.logoutUser}
                    />
                    <br/>
                    <br/>
                    <br/>
                <p>dynamic block</p>
                <PostList />
            </div>
        )
    }
}

export default Frame;
