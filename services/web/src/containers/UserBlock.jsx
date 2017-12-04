 /* eslint-disable no-undef */
 /* eslint-disable no-unused-expressions */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
            posts_count: 0,
            followers_count: 0,
            followin_count: 0,
            subscription_id: null
        };
        this.getUserData = this.getUserData.bind(this)
    }

    createSubscription = (event) => {
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
                    // is_followed: true,
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
                    // is_followed: false,
                    subscription_id: null
                })
            })
            .catch((error) => {
                this.props.createFlashMessage(error.message, 'error');
            })
    }

    getUserData(name) {
        const headers = {
            'Content-Type': 'application/json'
        }
        window.localStorage.authToken
            ? headers.Authorization = `Bearer ${window.localStorage.authToken}` : null;
        return axios.get(`http://localhost:3001/api/v1/users/user/${name}`, headers)
            .then((res) => {
                console.log(res)
                const user = res.data.user;
                this.setState({
                    userid: user.id,
                    username: user.username,
                    fullname: user.fullname,
                    description: user.description,
                    userpic: `data:image/png;base64, ${user.avatar}`,
                    followers_count: user.followers_count,
                    followin_count: user.followin_count,
                    // is_followed: user.is_followed
                    subscription_id: user.subscription_id,

                });
            })
            .catch((error) => {
                this.props.to404();
                this.props.createFlashMessage(error.message, 'error');
            });
    }

    componentDidMount() {
        console.log('userblock rerender')
        this.getUserData(this.props.user);
    }

    render() {
        const { is_authenticated } = this.props;
        return (
            <div className='container'>
                {
                    !this.state.username.length
                        ? <CircularProgress /> :
                            <div className='user-block'>
                                <div className='user-block-left'>
                                    <img src={this.state.userpic} alt={this.state.username} />
                                </div>
                                <div className='user-block-right'>
                                    <p>
                                        {this.state.username}
                                        {
                                            is_authenticated ?
                                                this.state.subscription_id ?
                                                    <span
                                                        id={this.state.subscription_id}
                                                        onClick={this.removeSubscription}>
                                                        Unfollow</span> :
                                                    <span
                                                        onClick={this.createSubscription}>
                                                        Follow</span>
                                                : null
                                        }
                                    </p>
                                    <h2>{this.state.fullname}</h2>
                                    <div>
                                        {
                                            is_authenticated ?
                                                <div>
                                                    <Link to={{ pathname: `/u/${this.state.username}/followers`, state: { modal: true } }} >
                                                        <span>{`${this.state.followers_count} followers `}</span>
                                                    </Link>
                                                    <Link to={{ pathname: `/u/${this.state.username}/followin`, state: { modal: true } }} >
                                                        <span>{`${this.state.followin_count} followin `}</span>
                                                    </Link>
                                                    <span>{`${this.state.posts_count} posts`}</span>
                                                </div> :
                                                <div>
                                                    <span>{`${this.state.followers_count} followers `}</span>
                                                    <span>{`${this.state.followin_count} followin `}</span>
                                                    <span>{`${this.state.posts_count} posts`}</span>
                                                </div>
                                        }

                                    </div>
                                    <p>{this.state.description}</p>
                                </div>
                            </div>
                }
            </div>
        );
    }
}

export default UserBlock;