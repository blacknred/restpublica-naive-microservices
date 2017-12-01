import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom'
import axios from 'axios';
import NotFound from '../components/NotFound';

import CircularProgress from 'material-ui/CircularProgress';

class UserBlock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            iserid: '',
            username: '',
            fullname: '',
            description: '',
            userpic: '',
            posts_count: null,
            followers_count: null,
            followin_count: null,
            subscription_id: null,
            is_followed: false
        };
    }

    /* eslint-disable */
    createSubscription = (event) => {
        const id = event.target.id;
        return axios.post(`http://localhost:3001/api/v1/users/subscription`, { id }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${window.localStorage.authToken}`
            }
        })
            .then((res) => {
                console.log(res)
                this.setState({ 
                    is_followed: true,
                    subscription_id: res.data.subscription
                 })
            })
            .catch((error) => {
                this.props.createFlashMessage(error.message, 'error');
            })
    }

    removeSubscription = (event) => {
        const id = event.target.id;
        return axios.delete(`http://localhost:3001/api/v1/users/subscription/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${window.localStorage.authToken}`
            }
        })
            .then((res) => {
                console.log(res)
                this.setState({
                    is_followed: false,
                    subscription_id: null
                })
            })
            .catch((error) => {
                this.props.createFlashMessage(error.message, 'error');
            })
    }
    /* eslint-enable */

    getUserData(name) {
        const options = {
            url: `http://localhost:3001/api/v1/users/u/${name}`,
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${window.localStorage.authToken}`
            }
        };
        return axios(options)
            .then((res) => {
                console.log(res)
                const user = res.data.user;
                this.setState({
                    userid: user.id,
                    username: user.username,
                    fullname: user.fullname,
                    description: user.description,
                    userpic: `data:image/png;base64, ${user.avatar}`,
                    posts_count: user.posts_count,
                    followers_count: user.followers_count,
                    followin_count: user.followin_count,
                    subscription_id: user.subscription_id,
                    is_followed: user.is_followed
                });
            })
            .catch((error) => {
                this.props.to404();
                this.props.createFlashMessage(error.message, 'error');
            });
    }

    componentDidMount() {
        this.getUserData(this.props.user);
    }

    render() {
        return (
            <div className='container'>
                {
                    !this.state.username.length
                        ? <CircularProgress /> :
                        <div className='dynamic-block'>
                            <div className='user-block'>
                                <div className='user-block-left'>
                                    <img src={this.state.userpic} alt={this.state.username} />
                                </div>
                                <div className='user-block-right'>
                                    <p>
                                        {this.state.username}
                                        {
                                            this.state.is_followed ?
                                                <span
                                                    id={this.state.subscription_id}
                                                    onClick={this.removeSubscription}>
                                                    Unfollow</span> :
                                                <span id={this.state.userid}
                                                    onClick={this.createSubscription}>
                                                    Follow</span>
                                        }
                                    </p>
                                    <h2>{this.state.fullname}</h2>
                                    <div>
                                        <span>{`${this.state.followers_count} followers  `}</span>
                                        <span>{`${this.state.followin_count} followin`}</span>
                                    </div>
                                    <p>{this.state.description}</p>
                                </div>
                            </div>
                        </div>
                }
            </div>
        );
    }
}

export default UserBlock;