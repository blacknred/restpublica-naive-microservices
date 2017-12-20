import React, { Component } from 'react'
import { Route, Redirect, Switch } from 'react-router-dom'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import NavigationCloseIcon from 'material-ui/svg-icons/navigation/close';

import './App.css';

import NotFound from '../components/NotFound';
import ContentNotFound from '../components/ContentNotFound';
import FlashMessages from '../components/FlashMessages';
import AppDrawer from '../components/Drawer';
import Header from '../components/Header';

import LandingIntro from './LandingIntro';
import Profile from './Profile';
import PostList from './PostList';
import User from './User';
import Search from './Search';
import Trending from './Trending';
import Post from './Post';
import PostEditor from './PostEditor';

class App extends Component {
    constructor(props) {
        super(props)
        this.previousLocation = this.props.location
        this.state = {
            isAuthenticated: false,
            user: {
                name: '',
                pic: ''
            },
            isContentNotFound: false,
            drawer: true,
            flashMessages: [],
            isNotify: true,
            notifications: [1, 2, 3],
        }
        this.authUser = this.authUser.bind(this)
        this.logoutUser = this.logoutUser.bind(this)
        this.updateUser = this.updateUser.bind(this)
        this.drawerToggle = this.drawerToggle.bind(this)
        this.notifyToggle = this.notifyToggle.bind(this)
        this.toggle404 = this.toggle404.bind(this)
        this.redirect = this.redirect.bind(this)
        this.deleteFlashMessage = this.deleteFlashMessage.bind(this)
        this.createFlashMessage = this.createFlashMessage.bind(this)
    }
    drawerToggle() {
        this.setState({ drawer: !this.state.drawer });
    }
    notifyToggle() {
        this.createFlashMessage(
            `Notifications turn ${this.state.isNotify ? 'off' : 'on'}`, 'notice');
        this.setState({ isNotify: !this.state.isNotify });
    }
    createFlashMessage(text, type = 'notice') {
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
        this.createFlashMessage('You are now logged out.')
        this.props.history.push('/')
    }
    toggle404() {
        this.setState({ isContentNotFound: !this.state.isContentNotFound })
    }
    redirect(url) {
        this.props.history.push(url)
    }
    componentWillMount() {
        const { authToken, userName, userPic } = window.localStorage;
        if (authToken) {
            this.setState({
                isAuthenticated: true,
                user: { name: userName, pic: userPic }
            })
        }
    }
    componentDidMount() {
        // this.props.history.push('/')
    }
    render() {
        const { location } = this.props
        const { isAuthenticated, user, drawer, flashMessages, isNotify, notifications,
            isContentNotFound } = this.state
        /* 
        -- modals engine --
        React-router Links with { modal:true } value will provoke is_modal to be true.
        When isModal is true Main switch routing will not go to new 
        location, stay on previousLocation and not render other component,
        but Modal switch routing will render proper modal component.
        React-router common Links without { modal:true } value will provoke is_modal be false
        and activate Main switch routing new location instead of Modal switch routing.
        */
        const isModal = !!(
            location.state &&
            location.state.modal &&
            this.previousLocation !== location // not initial render
        )

        const landing = (
            isAuthenticated ?
                <Redirect to='/' /> :
                <LandingIntro
                    authUser={this.authUser}
                    createFlashMessage={this.createFlashMessage}
                />
        );

        const dynamicFrame = (
            <div>
                <FlashMessages
                    deleteFlashMessage={this.deleteFlashMessage}
                    messages={flashMessages} />
                <Header
                    user={user}
                    isAuthenticated={isAuthenticated}
                    redirect={this.redirect}
                    logoutUser={this.logoutUser}
                    drawerToggle={this.drawerToggle}
                    isNotify={isNotify}
                    notifications={notifications}
                    notifyToggle={this.notifyToggle}
                    toggle404={this.toggle404}
                    isContentNotFound={this.state.isContentNotFound} />
                {
                    !isAuthenticated ? null :
                        <AppDrawer
                            //toggle404={this.toggle404}
                            isContentNotFound={this.state.isContentNotFound}
                            redirect={this.redirect}
                            drawer={drawer}
                            location={location.pathname} />
                }
                <div
                    className='frame'
                    style={{ marginLeft: drawer ? '235px' : '0px' }}
                >
                    {
                        isContentNotFound ? <Route component={ContentNotFound} /> :
                            <div>
                                <Route path='/dashboard' render={() => (
                                    <PostList
                                        mode='dashboard'
                                        drawer={this.state.drawer}
                                        createFlashMessage={this.createFlashMessage} />
                                )} />

                                <Route path='/search/:searchParam?' render={({ location }) => (
                                    <Search query={location.search} />
                                )} />

                                <Route path='/me/:mode' render={({ match }) => (
                                    <User
                                        user={this.state.user.name}
                                        isAuthenticated={isAuthenticated}
                                        drawer={this.state.drawer}
                                        notifications={notifications}
                                        mode='me'
                                        toggle404={this.toggle404}
                                        createFlashMessage={this.createFlashMessage} />
                                )} />

                                <Route path='/profile' render={() => (
                                    <Profile
                                        updateUser={this.updateUser}
                                        createFlashMessage={this.createFlashMessage}
                                    />
                                )} />

                                <Route path='/trending' render={() => (
                                    <Trending />
                                )} />

                                <Route path='/u/:username/:mode' render={({ match }) => (
                                    <User
                                        user={match.params.username}
                                        mode='user'
                                        isAuthenticated={this.state.isAuthenticated}
                                        toggle404={this.toggle404}
                                        drawer={this.state.drawer}
                                        createFlashMessage={this.createFlashMessage}
                                    />
                                )} />

                                <Route path='/p/:id' render={({ match }) => (
                                    <Post id={match.params.id} />
                                )} />
                            </div>
                    }
                </div>
            </div>
        );

        // const Modal = ({ match, history, location }) => {
        //     const back = (e) => {
        //         e.stopPropagation()
        //         history.goBack()
        //     }
        //     return (
        //         <div className='modal'>
        //             <Paper zDepth={1}>
        //                 <IconButton onClick={back} >
        //                     <NavigationCloseIcon />
        //                 </IconButton>
        //                 <Route path="/p/:id" render={({ match }) => (
        //                     <Post id={match.params.id} />
        //                 )} />
        //                 <Route path="/post" component={PostEditor} />
        //             </Paper>
        //         </div >
        //     );
        // }

        return (
            <MuiThemeProvider>
                <div>
                    <Switch location={isModal ? this.previousLocation : location}>

                        /* ***** landing, auth ***** */
                        <Route exact path='/' render={() => (
                            !isAuthenticated ?
                                <Redirect to='/login' /> :
                                <Redirect to={
                                    this.props.location.state == null ?
                                        '/dashboard' :
                                        this.props.location.state.referrer
                                } />
                        )} />

                        <Route path='/register' render={() => landing} />

                        <Route path='/login' render={() => landing} />


                        /* ***** auth paths ***** */
                        <Route path='/dashboard' render={() => (
                            isAuthenticated ? dynamicFrame : <Redirect to='/' />
                        )} />

                        <Route path='/me/:mode' render={() => (
                            isAuthenticated ? dynamicFrame :
                                <Redirect to={{
                                    pathname: '/',
                                    state: { referrer: this.props.location.pathname }
                                }} />
                        )} />

                        <Route path='/me' render={() => (
                            <Redirect to='/me/posts' />
                        )} />

                        <Route path='/profile' render={() => (
                            isAuthenticated ? dynamicFrame :
                                <Redirect to={{
                                    pathname: '/',
                                    state: { referrer: this.props.location.pathname }
                                }} />
                        )} />

                        <Route path='/post' render={() => <Redirect to='/' />} />


                        /* ***** non auth paths ***** */
                        <Route path='/trending' render={() => dynamicFrame} />

                        <Route path='/search/:searchParam?' render={({ location }) => (
                            (location.search).replace('?q=', '') !== ''
                                ? dynamicFrame : <Redirect to='/' />
                        )} />

                        <Route path='/u/:username/:mode' render={({ match }) => (
                            match.params.username === this.state.user.name ?
                                <Redirect to='/me' /> : dynamicFrame
                        )} />

                        <Route path='/u/:username' render={({ match }) => (
                            match.params.username === this.state.user.name ?
                                <Redirect to='/me' /> :
                                <Redirect to={`/u/${match.params.username}/posts`} />
                        )} />

                        <Route path='/p/:id' render={() => dynamicFrame} />


                        /* ***** toggle404 ***** */
                        <Route component={NotFound} />

                    </Switch>
                    {
                        !isModal ? null :
                        <Route render={({ history }) => (
                            <div className='modal'>
                                <Paper zDepth={1}>
                                    <IconButton onClick={() => history.goBack()} >
                                        <NavigationCloseIcon />
                                    </IconButton>
                                    <Route path="/p/:id" render={({ match }) => (
                                        <Post id={match.params.id} />
                                    )} />
                                    <Route path="/post" component={PostEditor} />
                                </Paper>
                            </div >
                        )} />
                    }
                </div>
            </MuiThemeProvider>
        )
    }
}

export default App
