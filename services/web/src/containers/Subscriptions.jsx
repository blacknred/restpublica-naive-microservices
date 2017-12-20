/* eslint-disable no-undef */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroller'

import CircularProgress from 'material-ui/CircularProgress';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import { List, ListItem } from 'material-ui/List';

import './Subscriptions.css';

const styles = {
    list: { width: '100%' },
    loader: {
        flex: 1, textAlign: 'center'
    }
}

class Subscriptions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: this.props.mode,
            userId: this.props.userId,
            empty: false,
            hasMore: true,
            subscriptions: []
        };
    }

    createSubscription = (id, name) => {
        this.props.createSubscription(id, name, true)
            .then((subscription_id) => {
                const new_subscriptions = this.state.subscriptions.map((sub) => {
                    if (sub.user_id === id) sub.my_subscription_id = subscription_id;
                    return sub;
                })
                this.setState({ subscriptions: new_subscriptions })
            })
    }

    removeSubscription = (id, name) => {
        this.props.removeSubscription(id, name, true)
            .then(() => {
                const new_subscriptions = this.state.subscriptions.map((sub) => {
                    if (sub.my_subscription_id === id) sub.my_subscription_id = null;
                    return sub;
                })
                this.setState({ subscriptions: new_subscriptions })
            })
    }

    getSubscriptions = (page) => {
        const headers = {
            headers: { 'Content-Type': 'application/json' }
        }
        if (window.localStorage.authToken) {
            headers.headers.Authorization = `Bearer ${window.localStorage.authToken}`;
        };
        return axios.get(`http://localhost:3001/api/v1/users/${this.state.mode}/${this.state.userId}?offset=${page}`, headers)
            .then((res) => {
                // console.log(res)
                if (parseInt(res.data.data.count, 2) === 0) {
                    this.setState({ empty: true, hasMore: false })
                } else {
                    this.setState({
                        subscriptions: (this.state.subscriptions).concat(res.data.data.subscriptions)
                    })
                }
                if (this.state.subscriptions.length >= res.data.data.count) {
                    console.log('overflow')
                    this.setState({ hasMore: false });
                }
                console.log(`Subscriptions - page:${page}, count:${res.data.data.count}, length:${this.state.subscriptions.length}`)
            })
            .catch((error) => {
                this.setState({ hasMore: false });
                this.props.createFlashMessage('Server error', 'error');
            });
    }

    componentDidMount() {
        console.log('subscriptions are mounted')
    }

    render() {
        const subscriptions = this.state.subscriptions.map((sub) => (
            <ListItem
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
                            onClick={() => {
                                this.removeSubscription(sub.my_subscription_id, sub.username)
                            }} />
                        :
                        <FlatButton
                            secondary={true}
                            label='Follow'
                            onClick={() => {
                                this.createSubscription(sub.user_id, sub.username)
                            }} />
                }
            />
        ))
        return (
            this.state.empty ?
                <div className='subscriptions'>
                    <p> There are no {this.state.mode}.</p>
                </div> :
                <div>
                    <InfiniteScroll
                        className="subscriptions"
                        pageStart={0}
                        initialLoad={true}
                        loadMore={this.getSubscriptions}
                        hasMore={this.state.hasMore}
                        loader={<CircularProgress style={styles.loader} />}
                        useWindow={true}
                        threshold={100} >
                        <List style={styles.list}>
                            {subscriptions}
                        </List>
                    </InfiniteScroll>
                </div>
        );
    }
}

export default Subscriptions;