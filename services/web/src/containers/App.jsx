import React, { Component } from 'react'
import { Route, Redirect, Switch } from 'react-router-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// import axios from 'axios';

import './App.css';

import Profile from './Profile';
import NewPost from './NewPost';
import Post from './Post';
import NotFound from '../components/NotFound';
import FlashMessages from '../components/FlashMessages';

import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import LandingIntro from '../components/LandingIntro';

import Header from './Header';
import PopularBlock from './PopularBlock';
import SearchBlock from './SearchBlock';
import UserBlock from './UserBlock';
import MineBlock from './MineBlock';
import PostList from './PostList';



class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            is404: false,
            flashMessages: [],
            isAuthenticated: false,
            user: {
                name: '',
                pic: ''
            }
        }
        this.authUser = this.authUser.bind(this)
        this.logoutUser = this.logoutUser.bind(this)
        this.updateUser = this.updateUser.bind(this)
        this.to404 = this.to404.bind(this)
        this.deleteFlashMessage = this.deleteFlashMessage.bind(this)
        this.createFlashMessage = this.createFlashMessage.bind(this)
    }
    createFlashMessage(text, type = 'success') {
        const message = { text, type }
        this.setState({
            flashMessages: [...this.state.flashMessages, message]
        })
    }
    deleteFlashMessage(index) {
        if (index > 0) {
            this.setState({
                flashMessages: [
                    ...this.state.flashMessages.slice(0, index),
                    ...this.state.flashMessages.slice(index + 1)
                ]
            })
        } else {
            this.setState({
                flashMessages: [...this.state.flashMessages.slice(index + 1)]
            })
        }
    }
    authUser(userData, mode) {
        window.localStorage.setItem('authToken', userData.token)
        window.localStorage.setItem('userId', userData.id)
        window.localStorage.setItem('userName', userData.username)
        window.localStorage.setItem('userPic', userData.avatar)
        this.setState({
            isAuthenticated: true,
            user: { name: userData.username, pic: userData.avatar }
        })
        this.createFlashMessage(`You successfully ${mode}! Welcome!`)
        this.props.history.push('/')
    }
    updateUser(userData) {
        if (userData.username) {
            window.localStorage.setItem('userName', userData.username)
            this.setState({
                user: { name: userData.username }
            })
        }
        if (userData.avatar) {
            window.localStorage.setItem('userPic', userData.avatar)
            this.setState({
                user: { pic: userData.avatar }
            })
        }
        this.createFlashMessage(`You successfully update profile!`)
    }
    logoutUser(e) {
        e.preventDefault()
        window.localStorage.clear()
        this.setState({
            isAuthenticated: false,
            user: {
                name: '',
                pic: ''
            }
        })
        this.props.history.push('/')
        this.createFlashMessage('You are now logged out.')
    }
    to404() {
        this.setState({ is404: true })
    }
    componentDidMount() {
        const { authToken, userName, userPic } = window.localStorage;
        if (authToken) {
            this.setState({
                isAuthenticated: true,
                user: { name: userName, pic: userPic }
            })
        }
    }
    render() {
        const { isAuthenticated, flashMessages } = this.state

        const loginForm = <LoginForm
            createFlashMessage={this.createFlashMessage}
            authUser={this.authUser} />
        const registerForm = <RegisterForm
            createFlashMessage={this.createFlashMessage}
            authUser={this.authUser} />
        const landing =
            <div>
                <Route path='/login' render={() => (loginForm)} />
                <Route path='/register' render={() => (registerForm)} />
                <LandingIntro />
            </div>;
        const frame = <div>
            <Header
                user={this.state.user}
                logoutUser={this.logoutUser}
            />
            <div>
                <Route path="/mine" component={MineBlock} />
                <Route path="/search" component={SearchBlock} />
                <Route path="/popular" component={PopularBlock} />
            </div>
            <div>
                <Route path="/mine" render={() => (<PostList mode={`user/${window.localStorage.getItem('username')}`} />)} />
                <Route path="/search" render={() => (<PostList mode='search' />)} />
                <Route path="/popular" render={() => (<PostList mode='popular' />)} />
                <Route path="/dashboard" render={() => (<PostList mode='dashboard' />)} />
            </div>
        </div>;
        const userFrame = ({ match }) => (
            <div>
                <Header
                    user={this.state.user}
                    logoutUser={this.logoutUser} />
                <div>
                    <UserBlock
                        user={match.params.id}
                        to404={this.to404}
                    />
                </div>
                <div>
                    <PostList mode={match.params.id} />
                </div>
            </div>);

        const profile = <div>
            <Header
                user={this.state.user}
                logoutUser={this.logoutUser}
            />
            <Profile
                updateUser={this.updateUser}
                createFlashMessage={this.createFlashMessage}
            />
        </div>;

        return (
            <MuiThemeProvider>
                <div>
                    <FlashMessages
                        deleteFlashMessage={this.deleteFlashMessage}
                        messages={flashMessages} />

                    {
                        this.state.is404 ?
                            <Route component={NotFound} /> :
                            <Switch>

                                /* landing, auth */

                                <Route exact path='/' render={() => (
                                    !isAuthenticated ? landing
                                        : <Redirect to={
                                            this.props.location.state == null
                                                ? '/dashboard'
                                                : this.props.location.state.referrer
                                        } />
                                )} />
                                <Route path='/register' render={() => (
                                    isAuthenticated ? <Redirect to='/' /> : landing
                                )} />
                                <Route path='/login' render={() => (
                                    isAuthenticated ? <Redirect to='/' /> : landing
                                )} />

                                /* normal paths */

                                <Route path='/popular' render={() => (frame)} />
                                <Route path='/dashboard' render={() => (
                                    isAuthenticated ? frame : <Redirect to={{ pathname: '/' }} />
                                )} />
                                <Route path='/search' render={() => (
                                    isAuthenticated ? frame
                                        : <Redirect to={{
                                            pathname: '/',
                                            state: { referrer: this.props.location.pathname }
                                        }} />
                                )} />
                                <Route path='/mine' render={() => (
                                    isAuthenticated ? frame
                                        : <Redirect to={{
                                            pathname: '/',
                                            state: { referrer: this.props.location.pathname }
                                        }} />
                                )} />
                                <Route path='/u/:id' component={userFrame} />
                                <Route path='/profile' render={() => (
                                    isAuthenticated ? profile : <Redirect to={{ pathname: '/' }} />
                                )} />

                                /* modals */

                                <Route path='/p/:id' render={() => ({ Post })} />
                                <Route path='/post' render={() => (
                                    isAuthenticated ? <NewPost /> : <Redirect to={{ pathname: '/' }} />
                                )} />

                                /* not found */

                                <Route component={NotFound} />
                            </Switch>
                    }
                </div>
            </MuiThemeProvider>
        )
    }
}

export default App
