import React, { Component } from 'react'
import { Route, Redirect, Switch } from 'react-router-dom'

import './App.css';

import Landing from './Landing';
import Frame from './Frame';
import Profile from './Profile';
import NewPost from './NewPost';
import Post from './Post';
import FlashMessages from '../components/FlashMessages';
import NotFound from '../components/NotFound';

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            flashMessages: [],
            isAuthenticated: false
        }
        this.authUser = this.authUser.bind(this)
        this.logoutUser = this.logoutUser.bind(this)
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
        window.localStorage.setItem('userid', userData.id)
        window.localStorage.setItem('username', userData.name)
        window.localStorage.setItem('userimg', userData.avatar)
        this.setState({ isAuthenticated: true })
        this.createFlashMessage(`You successfully ${mode}! Welcome!`)
        this.props.history.push('/')
    }
    logoutUser(e) {
        e.preventDefault()
        window.localStorage.clear()
        this.setState({ isAuthenticated: false })
        this.props.history.push('/')
        this.createFlashMessage('You are now logged out.')
    }
    componentDidMount() {
        const token = localStorage.getItem('authToken')
        if (token) this.setState({ isAuthenticated: true })
    }
    render() {
        const { isAuthenticated, flashMessages } = this.state
        const landing = <Landing
            authUser={this.authUser}
            createFlashMessage={this.createFlashMessage}
        />
        const frame = <Frame
            createFlashMessage={this.createFlashMessage}
            logoutUser={this.logoutUser}
        />
        return (
            <div className='App container'>
                <br />
                <FlashMessages
                    deleteFlashMessage={this.deleteFlashMessage}
                    messages={flashMessages} />
                <Switch>
                    <Route exact path='/' render={() => (
                        isAuthenticated
                            ? <Redirect to={
                                this.props.location.state == null
                                    ? '/dashboard'
                                    : this.props.location.state.referrer
                            } />
                            : landing
                    )} />
                    <Route path='/register' render={() => (
                        isAuthenticated
                            ? <Redirect to='/' />
                            : landing
                    )} />
                    <Route path='/login' render={() => (
                        isAuthenticated
                            ? <Redirect to='/' />
                            : landing
                    )} />



                    <Route path='/popular' render={() => ( frame )} />
                    <Route path='/dashboard' render={() => (
                        isAuthenticated
                            ? frame
                            : <Redirect to={{ pathname: '/' }} />
                    )} />
                    <Route path='/search' render={() => (
                        isAuthenticated
                            ? frame
                            : <Redirect to={{
                                pathname: '/',
                                state: { referrer: this.props.location.pathname }
                            }} />
                    )} />
                    <Route path='/mine' render={() => (
                        isAuthenticated
                            ? frame
                            : <Redirect to={{
                                pathname: '/',
                                state: { referrer: this.props.location.pathname }
                            }} />
                    )} />



                    <Route path='/u/:name' render={() => ({ frame })} />


                    <Route path='/p/:id' render={() => ({ Post })} />
                    <Route path='/newpost' render={() => (
                        isAuthenticated
                            ? <NewPost />
                            : <Redirect to={{ pathname: '/' }} />
                    )} />
                    <Route path='/profile' render={() => (
                        isAuthenticated
                            ? <Profile />
                            : <Redirect to={{ pathname: '/' }} />
                    )} />
                    <Route component={NotFound} />
                </Switch>
            </div>
        )
    }
}

export default App
