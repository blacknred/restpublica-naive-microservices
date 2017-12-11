/* eslint-disable no-undef */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import CircularProgress from 'material-ui/CircularProgress';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';

class UserBlock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            iserid: '',
            username: '',
            fullname: '',
            description: '',
            userpic: '',
            posts_count: 0,
            followers_count: 0,
            followin_count: 0,
            subscription_id: null
        };
    }

    createSubscription = () => {
        const id = this.state.userid;
        return axios.post(`http://localhost:3001/api/v1/users/subscription`, { id }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${window.localStorage.authToken}`
            }
        })
            .then((res) => {
                console.log(res)
                this.setState({ 
                    subscription_id: res.data.subscription, 
                    followers_count: ++this.state.followers_count 
                })
            })
            .catch((error) => {
                this.props.createFlashMessage(error.message, 'error');
            })
    }
    removeSubscription = () => {
        const id = this.state.subscription_id;
        return axios.delete(`http://localhost:3001/api/v1/users/subscription/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${window.localStorage.authToken}`
            }
        })
            .then((res) => {
                console.log(res)
                this.setState({ 
                    subscription_id: null, 
                    followers_count: --this.state.followers_count 
                })
            })
            .catch((error) => {
                this.props.createFlashMessage(error.message, 'error');
            })
    }
    getUserData(name) {
        const headers = {
            headers: { 'Content-Type': 'application/json' }
        }
        if (window.localStorage.authToken) {
            headers.headers.Authorization = `Bearer ${window.localStorage.authToken}`;
        };
        return axios.get(`http://localhost:3001/api/v1/users/user/${name}`, headers)
            .then((res) => {
                console.log(res);
                const user = res.data.user;
                this.setState({
                    userid: user.id,
                    username: user.username,
                    fullname: user.fullname,
                    description: user.description,
                    userpic: `data:image/png;base64, ${user.avatar}`,
                    followers_count: user.followers_count,
                    followin_count: user.followin_count,
                    subscription_id: user.subscription_id
                });
            })
            .catch((error) => {
                this.props.to404();
                this.props.createFlashMessage(error.message, 'error');
            });
    }
    componentDidMount() {
        console.log('userblock mount')
        this.getUserData(this.props.user);
    }

    render() {
        const { is_authenticated } = this.props;
        return (
            !this.state.username.length
                ? <CircularProgress /> :
                <div className='user-block'>
                    <Avatar
                        size={130}
                        src={this.state.userpic}
                        alt={this.state.username} />
                    <div className='user-block-right'>
                        <h2>
                            <span>
                                {this.state.fullname}
                                <small><small>{` @${this.state.username}`}</small></small>
                            </span>

                            {
                                is_authenticated ?
                                    this.state.subscription_id ?
                                        <FlatButton
                                            secondary={true}
                                            label='Unfollow'
                                            id={this.state.subscription_id}
                                            onClick={this.removeSubscription} />
                                        :
                                        <FlatButton
                                            secondary={true}
                                            label='Follow'
                                            id={this.state.subscription_id}
                                            onClick={this.createSubscription} />
                                    : null
                            }
                        </h2>
                        {
                            is_authenticated ?
                                <div>
                                    <FlatButton label={
                                        <Link to={{
                                            pathname: `/u/${this.state.username}/followers`,
                                            state: { modal: true, userid: this.state.userid }
                                        }} >
                                            <span>{`${this.state.followers_count} followers `}</span>
                                        </Link>
                                    } />
                                    <FlatButton label={
                                        <Link to={{
                                            pathname: `/u/${this.state.username}/followin`,
                                            state: { modal: true, userid: this.state.userid }
                                        }} >
                                            <span>{`${this.state.followin_count} followin `}</span>
                                        </Link>
                                    } />
                                    <FlatButton label={`${this.state.posts_count} posts`} />
                                </div> :
                                <div>
                                    <FlatButton label={`${this.state.followers_count} followers `} />
                                    <FlatButton label={`${this.state.followin_count} followin `} />
                                    <FlatButton label={`${this.state.posts_count} posts`} />
                                </div>
                        }
                        <p>{this.state.description}</p>
                    </div>
                </div>
        );
    }
}

export default UserBlock;