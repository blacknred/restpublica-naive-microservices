/* eslint-disable no-undef */
import React, { Component } from 'react';
import { NavLink, Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';

import CircularProgress from 'material-ui/CircularProgress';

import UserBlock from '../components/UserBlock';
import PostList from './PostList';
import Subscriptions from './Subscriptions';
import Activity from './Activity';

const styles = {
    tab: {
        padding: '10px 20px', fontSize: '0.9em'
    },
    activeTab: {
        borderBottom: '2px solid red'
    }
}

class User extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: null,
            username: null,
            fullname: null,
            description: null,
            userpic: null,
            posts_count: 0,
            followers_count: 0,
            followin_count: 0,
            mySubscriptionId: null
        };
    }

    setPostsCount = (count) => {
        this.setState({ posts_count: count })
    }

    createSubscription = (id, name, fromSubscriptions = false) => {
        return axios.post(`http://localhost:3001/api/v1/users/subscription`, { id }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${window.localStorage.authToken}`
            }
        })
            .then((res) => {
                // console.log(res)
                this.props.createFlashMessage(`You are reading ${name} now`, 'success');

                if (fromSubscriptions) {
                    if (this.props.mode === 'me') {
                        this.setState({ followin_count: ++this.state.followin_count })
                    }
                    return res.data.subscription;
                }

                this.setState({
                    followers_count: ++this.state.followers_count,
                    mySubscriptionId: res.data.subscription
                })
                return res.data.subscription;
            })
            .catch((error) => {
                this.props.createFlashMessage('Server problem', 'error');
            })
    }

    removeSubscription = (id, name, fromSubscriptions = false) => {
        return axios.delete(`http://localhost:3001/api/v1/users/subscription/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${window.localStorage.authToken}`
            }
        })
            .then((res) => {
                // console.log(res)
                this.props.createFlashMessage(`You are not reading ${name}`, 'success');

                if (fromSubscriptions) {
                    if (this.props.mode === 'me') {
                        this.setState({ followin_count: --this.state.followin_count })
                    }
                    return
                }
                this.setState({
                    followers_count: --this.state.followers_count,
                    mySubscriptionId: null
                })
            })
            .catch((error) => {
                this.props.createFlashMessage('Server problem', 'error');
            })
    }

    getUserData = (name) => {
        const headers = {
            headers: { 'Content-Type': 'application/json' }
        }
        if (window.localStorage.authToken) {
            headers.headers.Authorization = `Bearer ${window.localStorage.authToken}`;
        };
        return axios.get(`http://localhost:3001/api/v1/users/user/${name}`, headers)
            .then((res) => {
                // console.log(res);
                const user = res.data.user;
                this.setState({
                    userId: user.id,
                    username: user.username,
                    fullname: user.fullname,
                    description: user.description,
                    userpic: `data:image/png;base64, ${user.avatar}`,
                    followers_count: user.followers_count,
                    followin_count: user.followin_count,
                    mySubscriptionId: user.subscription_id
                });
            })
            .catch((error) => {
                this.props.toggle404();
            });
    }

    componentDidMount() {
        console.log('userpage is mounted')
        this.getUserData(this.props.user);
    }

    render() {
        const { isAuthenticated, mode, drawer, createFlashMessage } = this.props;
        const notifications = this.props.notifications ? this.props.notifications : []
        const meTabs = (
            <div>
                <NavLink
                    to={`/me/activity`}
                    style={styles.tab}
                    activeStyle={styles.activeTab} >
                    {notifications.length} ACTIVITY
                </NavLink>
                <NavLink
                    to='/me/posts'
                    style={styles.tab}
                    activeStyle={styles.activeTab} >
                    {this.state.posts_count} POSTS
                </NavLink>
                <NavLink
                    to='/me/followers'
                    style={styles.tab}
                    activeStyle={styles.activeTab} >
                    {this.state.followers_count} FOLLOWERS
                </NavLink>
                <NavLink
                    to='/me/followin'
                    style={styles.tab}
                    activeStyle={styles.activeTab} >
                    {this.state.followin_count} FOLLOWIN
                </NavLink>
            </div>
        );
        const userTabs = (
            <div>
                <NavLink
                    to={`/u/${this.state.username}/posts`}
                    style={styles.tab}
                    activeStyle={styles.activeTab} >
                    {this.state.posts_count} POSTS
                </NavLink>
                <NavLink
                    to={`/u/${this.state.username}/followers`}
                    style={styles.tab}
                    activeStyle={styles.activeTab} >
                    {this.state.followers_count} FOLLOWERS
                </NavLink>
                <NavLink
                    to={`/u/${this.state.username}/followin`}
                    style={styles.tab}
                    activeStyle={styles.activeTab} >
                    {this.state.followin_count} FOLLOWIN
                </NavLink>
            </div>
        );
        const meDynamicContent = (
            <Switch>
                <Route path='/me/:mode(activity)' render={({ match }) => (
                    <Activity
                        user={this.state.username} />
                )} />
                <Route path='/me/:mode(posts)' render={() => (
                    <PostList
                        mode={`user/${this.state.username}`}
                        drawer={drawer}
                        setPostsCount={this.setPostsCount}
                        createFlashMessage={createFlashMessage}
                    />
                )} />
                <Route path='/me/:mode(followers|followin)' render={({ match }) => (
                    <Subscriptions
                        key={match.params.mode}
                        userId={this.state.userId}
                        mode={match.params.mode}
                        isAuthenticated={isAuthenticated}
                        createFlashMessage={createFlashMessage}
                        createSubscription={this.createSubscription}
                        removeSubscription={this.removeSubscription}
                    />
                )} />
                <Route render={() => (<Redirect to={`/me/posts`} />)} />
            </Switch>
        );
        const userDynamicContent = (
            <Switch>
                <Route path='/u/:username/:mode(posts)' render={() => (
                    <PostList
                        mode={`user/${this.state.username}`}
                        drawer={drawer}
                        setPostsCount={this.setPostsCount}
                        createFlashMessage={createFlashMessage}
                    />
                )} />
                {
                    !isAuthenticated ? null :
                        <Route path='/u/:username/:mode(followers|followin)' render={({ match }) => (
                            <Subscriptions
                                key={match.params.mode}
                                userId={this.state.userId}
                                mode={match.params.mode}
                                isAuthenticated={isAuthenticated}
                                createFlashMessage={createFlashMessage}
                                createSubscription={this.createSubscription}
                                removeSubscription={this.removeSubscription}
                            />
                        )} />
                }
                <Route render={() => (<Redirect to={`/u/${this.props.user}/posts`} />)} />
            </Switch>
        );
        return (
            !this.state.username ? <CircularProgress /> :
                <div>
                    <UserBlock
                        mode={mode}
                        userId={this.state.userId}
                        userpic={this.state.userpic}
                        username={this.state.username}
                        fullname={this.state.fullname}
                        description={this.state.description}
                        isAuthenticated={isAuthenticated}
                        mySubscriptionId={this.state.mySubscriptionId}
                        removeSubscription={this.removeSubscription}
                        createSubscription={this.createSubscription}
                    />
                    {
                        !isAuthenticated ? null : mode === 'me' ? meTabs : userTabs
                    }
                    <br />
                    {
                        mode === 'me' ? meDynamicContent : userDynamicContent
                    }
                </div >
        );
    }
}

export default User;






