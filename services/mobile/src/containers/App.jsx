import React, { Component } from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import { Route, Redirect, Switch } from 'react-router-dom'

import { grey50 } from 'material-ui/styles/colors';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import IconButton from 'material-ui/IconButton';
import NavigationCloseIcon from 'material-ui/svg-icons/navigation/close';
import Dialog from 'material-ui/Dialog';
import Paper from 'material-ui/Paper';

import './App.css';

import NotFound from '../components/NotFound';
import ContentNotFound from '../components/ContentNotFound';
import FlashMessages from '../components/FlashMessages';
import AppDrawer from '../components/Drawer';
import Header from '../components/Header';
import TrendingBlock from '../components/TrendingBlock';
import UsersBlock from '../components/UsersBlock';
import SearchBlock from '../components/SearchBlock';

import LandingIntro from './LandingIntro';
import Profile from './Profile';
import PostList from './PostList';
import User from './User';
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
            notifications: [1, 2, 3],
            isNotify: false,
            isNightMode: false
        }
        this.authUser = this.authUser.bind(this)
        this.logoutUser = this.logoutUser.bind(this)
        this.updateUser = this.updateUser.bind(this)
        this.drawerToggle = this.drawerToggle.bind(this)
        this.notifyToggle = this.notifyToggle.bind(this)
        this.nightModeToggle = this.nightModeToggle.bind(this)
        this.toggle404 = this.toggle404.bind(this)
        this.redirect = this.redirect.bind(this)
        this.deleteFlashMessage = this.deleteFlashMessage.bind(this)
        this.createFlashMessage = this.createFlashMessage.bind(this)
    }
    drawerToggle() {
        this.setState({ drawer: !this.state.drawer });
    }
    notifyToggle() {
        const cur = this.state.isNotify;
        this.setState({ isNotify: !cur });
        window.localStorage.setItem('userNotify', !cur);
        this.createFlashMessage(
            `Notifications are turn ${this.state.isNotify ? 'off' : 'on'}`, 'notice');
    }
    nightModeToggle() {
        const val = !this.state.isNightMode;
        this.setState({ isNightMode: val });
        window.localStorage.setItem('userNightMode', val);
        this.createFlashMessage(
            `Night mode is ${this.state.isNightMode ? 'off' : 'on'}`, 'notice');
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
        window.localStorage.setItem('userNotify', true)
        window.localStorage.setItem('userNightMode', false)
        this.setState({
            isAuthenticated: true,
            user: { name: userData.username, pic: userData.avatar },
            isNotify: true,
            isNightMode: false,
        })
        this.createFlashMessage(`You successfully ${mode}! Welcome!`)
        this.props.history.push('/')
        if (mode === 'registered') alert('Introduce')
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
            drawer: false,
            isNightMode: false,
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
        const { authToken, userName, userPic, userNotify,
            userNightMode } = window.localStorage;
        if (authToken) {
            this.setState({
                isAuthenticated: true,
                user: { name: userName, pic: userPic },
                isNotify: userNotify === 'true',
                isNightMode: userNightMode === 'true'
            })
        }
    }
    componentWillUpdate(nextProps) {
        const { location } = this.props
        if (
            nextProps.history.action !== 'POP' &&
            (!location.state || !location.state.modal)
        ) {
            /* set previousLocation if props.location is not modal */
            this.previousLocation = this.props.location
        }
    }
    render() {
        const { location } = this.props
        const { isAuthenticated, user, drawer, flashMessages, isNotify, notifications,
            isContentNotFound, isNightMode } = this.state

        const isModal = !!(
            /* 
                -- modals engine --
                React-router Links with { modal:true } value will provoke is_modal to be true.
                When isModal is true Main switch routing will not go to new 
                location, stay on previousLocation and not render other component,
                but Modal switch routing will render proper modal component.
                React-router common Links without { modal:true } value will provoke is_modal be false
                and activate Main switch routing new location instead of Modal switch routing.
            */
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
                    isNightMode={isNightMode}
                    nightModeToggle={this.nightModeToggle}
                    toggle404={this.toggle404}
                    isContentNotFound={isContentNotFound} />
                {
                    !isAuthenticated ? null :
                        <AppDrawer
                            className='drawer'
                            toggle404={this.toggle404}
                            isContentNotFound={isContentNotFound}
                            redirect={this.redirect}
                            drawer={drawer}
                            location={location.pathname}
                            isNightMode={isNightMode} />
                }
                <div className={drawer ? 'frame open' : 'frame'}>
                    <CSSTransitionGroup
                        transitionName='fade'
                        transitionEnterTimeout={300}
                        transitionLeaveTimeout={300}>
                        <Switch key={location.key} location={location}>
                            <Route path='/dashboard' render={() => (
                                <PostList
                                    mode='dashboard'
                                    drawer={drawer}
                                    isAuthenticated={isAuthenticated}
                                    isFullAccess={false}
                                    isNightMode={isNightMode}
                                    createFlashMessage={this.createFlashMessage} />
                            )} />

                            <Route path='/trending' render={() => (
                                <div>
                                    <TrendingBlock />
                                    <UsersBlock />
                                    <PostList
                                        mode='trending'
                                        drawer={drawer}
                                        isAuthenticated={isAuthenticated}
                                        isFullAccess={false}
                                        isNightMode={isNightMode}
                                        createFlashMessage={this.createFlashMessage} />
                                </div>
                            )} />

                            <Route path='/search/:searchParam?' render={({ location }) => (
                                <div>
                                    <SearchBlock />
                                    <UsersBlock />
                                    <PostList
                                        mode={`search${location.search}`}
                                        drawer={drawer}
                                        isAuthenticated={isAuthenticated}
                                        isFullAccess={false}
                                        isNightMode={isNightMode}
                                        createFlashMessage={this.createFlashMessage} />
                                </div>
                            )} />

                            <Route path='/me/:mode' render={({ match }) => (
                                <User
                                    user={user.name}
                                    isAuthenticated={isAuthenticated}
                                    drawer={drawer}
                                    notifications={notifications}
                                    mode='me'
                                    redirect={this.redirect}
                                    toggle404={this.toggle404}
                                    isNightMode={isNightMode}
                                    createFlashMessage={this.createFlashMessage} />
                            )} />

                            <Route path='/profile' render={() => (
                                <Profile
                                    updateUser={this.updateUser}
                                    createFlashMessage={this.createFlashMessage}
                                />
                            )} />

                            <Route path='/u/:username/:mode' render={({ match }) => (
                                isContentNotFound ? <Route component={ContentNotFound} /> :
                                    <User
                                        user={match.params.username}
                                        mode='user'
                                        isAuthenticated={isAuthenticated}
                                        redirect={this.redirect}
                                        toggle404={this.toggle404}
                                        drawer={drawer}
                                        isNightMode={isNightMode}
                                        createFlashMessage={this.createFlashMessage}
                                    />
                            )} />

                            <Route path='/p/:id' render={({ match }) => (
                                isContentNotFound ? <Route component={ContentNotFound} /> :
                                    <Post id={match.params.id} />
                            )} />
                        </Switch>
                    </CSSTransitionGroup>
                </div>
            </div >
        );

        return (
            <MuiThemeProvider muiTheme={getMuiTheme(isNightMode ? darkBaseTheme : lightBaseTheme)}>
                <Paper style={Object.assign({}, { minHeight: '110vh' }, isNightMode ? null : { backgroundColor: grey50 })}>
                    <Switch location={isModal ? this.previousLocation : location}>

                        {/* ***** landing, auth ***** */}
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


                        {/* ***** auth paths ***** */}
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


                        {/* ***** non auth paths ***** */}
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


                        {/* ***** 404 ***** */}
                        <Route component={NotFound} />

                    </Switch>
                    {
                        !isModal ? null :
                            <Route render={({ history }) => (
                                <Dialog
                                    actions={
                                        <IconButton onClick={() => history.goBack()} >
                                            <NavigationCloseIcon />
                                        </IconButton>
                                    }
                                    modal={true}
                                    contentStyle={{ width: 'auto', maxWidth: 'none' }}
                                    open={true} >
                                    <Switch>
                                        <Route path="/newpost" component={PostEditor} />
                                        <Route path="/p/:id/:mode(delete)" component={PostEditor} />
                                        <Route path="/p/:id/:mode(edit)" component={PostEditor} />
                                        <Route path="/p/:id" render={({ match }) => (
                                            <Post id={match.params.id} />
                                        )} />
                                    </Switch>
                                </Dialog>
                            )} />
                    }
                </Paper>
            </MuiThemeProvider>
        )
    }
}

export default App
