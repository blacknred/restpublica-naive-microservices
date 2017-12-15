/* eslint-disable no-undef */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import CircularProgress from 'material-ui/CircularProgress';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';

const styles = {
    list: { width: '100%' }
}

class Subscriptions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userid: this.props.user,
            subscriptions: []
        };
    }

    removeSubscription = (id) => {
        return axios.delete(`http://localhost:3001/api/v1/users/subscription/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${window.localStorage.authToken}`
            }
        })
            .then((res) => {
                console.log(res)
                const new_subscriptions = this.state.subscriptions;
                new_subscriptions.forEach((sub) => {
                    if (sub.my_subscription_id === id) sub.my_subscription_id = null;
                })
                this.setState({ subscriptions: new_subscriptions })
            })
            .catch((error) => {
                this.props.createFlashMessage(error.message, 'error');
            })
    }

    createSubscription = (id) => {
        return axios.post(`http://localhost:3001/api/v1/users/subscription`, { id }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${window.localStorage.authToken}`
            }
        })
            .then((res) => {
                console.log(res)
                const new_subscriptions = this.state.subscriptions;
                new_subscriptions.forEach((sub) => {
                    if (sub.user_id === id) sub.my_subscription_id = res.data.subscription;
                })
                this.setState({ subscriptions: new_subscriptions })
            })
            .catch((error) => {
                this.props.createFlashMessage(error.message, 'error');
            })
    }

    getUserSubscriptions(mode, userid) {
        const headers = {
            headers: { 'Content-Type': 'application/json' }
        }
        if (window.localStorage.authToken) {
            headers.headers.Authorization = `Bearer ${window.localStorage.authToken}`;
        };
        return axios.get(`http://localhost:3001/api/v1/users/${mode}/${userid}`, headers)
            .then((res) => {
                console.log(res)
                this.setState({ subscriptions: res.data.subscriptions })
            })
            .catch((error) => {
                this.props.createFlashMessage(error.message, 'error');
            })
    }

    getUserId(name) {
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
                this.setState({ userid: user.id });
            })
            .catch((error) => {
                this.props.to404();
                this.props.createFlashMessage(error.message, 'error');
            });
    }

    componentDidMount() {
        console.log('subscriptions mount')
        if (this.props.user && /^\+?\d+$/.test(this.props.user)) {
            this.getUserSubscriptions(this.props.mode, this.props.user);
        } else {
            this.getUserId(this.props.user)
                .then(() => {
                    this.getUserSubscriptions(this.props.mode, this.state.userid);
                })
        }
    }

    render() {
        return (
            <div className='subscriptions'>
                {
                    !this.state.subscriptions.length
                        ? <CircularProgress /> :
                        <List style={styles.list}>
                            <Subheader>{this.props.mode}</Subheader>
                            {
                                this.state.subscriptions.map((sub) => {
                                    return <ListItem
                                        key={sub.subscription_id}
                                        primaryText={
                                            <Link to={`/u/${sub.username}`}>{sub.username}</Link>
                                        }
                                        secondaryText={sub.fullname}
                                        leftAvatar={
                                            <Link to={`/u/${sub.username}`}>
                                                <Avatar
                                                    src={`data:image/png;base64, ${sub.avatar}`}
                                                    alt={sub.username}
                                                />
                                            </Link>
                                        }
                                        rightIconButton={
                                            sub.my_subscription_id ?
                                                <FlatButton
                                                    secondary={true}
                                                    label='Unfollow'
                                                    id={sub.my_subscription_id}
                                                    onClick={() => this.removeSubscription(sub.my_subscription_id)} />
                                                :
                                                <FlatButton
                                                    secondary={true}
                                                    label='Follow'
                                                    id={sub.user_id}
                                                    onClick={() => this.createSubscription(sub.user_id)} />
                                        }
                                    />
                                })
                            }
                        </List>
                }
            </div>

        );
    }



}

export default Subscriptions;