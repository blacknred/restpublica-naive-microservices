import React, { Component } from 'react'
import { Route, Redirect, Switch } from 'react-router-dom'
// import axios from 'axios';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import NavigationCloseIcon from 'material-ui/svg-icons/navigation/close';

import './App.css';

import NotFound from '../components/NotFound';
import FlashMessages from '../components/FlashMessages';
import AppDrawer from '../components/Drawer';

import LandingIntro from '../components/LandingIntro';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';

import Header from './Header';
import PopularBlock from './PopularBlock';
import SearchBlock from './SearchBlock';
import UserBlock from './UserBlock';
import MineBlock from './MineBlock';
import Profile from './Profile';
import PostList from './PostList';
import Post from './Post';
import Subscriptions from './Subscriptions';

import PostEditor from './PostEditor';

class App extends Component {
    constructor(props) {
        super(props)
        this.previousLocation = this.props.location
        this.state = {
            is404: false,
            drawer: false,
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
        this.drawerToggle = this.drawerToggle.bind(this)
        this.to404 = this.to404.bind(this)
        this.redirect = this.redirect.bind(this)
        this.deleteFlashMessage = this.deleteFlashMessage.bind(this)
        this.createFlashMessage = this.createFlashMessage.bind(this)
    }
    drawerToggle() {
        this.setState({ drawer: !this.state.drawer });
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
        this.createFlashMessage('You are now logged out.')
        this.props.history.push('/')
    }
    to404() {
        this.setState({ is404: true })
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
        const { isAuthenticated, flashMessages } = this.state
        /* 
        - modals engine -
        React-router Links with { modal:true } value will provoke is_modal be true.
        When isModal is true Main switch routing will not go to new 
        location, stay on previousLocation and not render other component,
        but Modal switch routing will render proper modal component.
        React-router common Links without { modal:true } value will provoke is_modal be false
        and activate Main switch routing new location instead of Modal switch routing.
        */
        const isModal = !!(
            location.state &&
            location.state.modal &&
            this.previousLocation !== location)// not initial render
        // elements
        const landing =
            <div>
                <Route path='/login' render={() => (
                    <LoginForm
                        createFlashMessage={this.createFlashMessage}
                        authUser={this.authUser} />
                )} />
                <Route path='/register' render={() => (
                    <RegisterForm
                        createFlashMessage={this.createFlashMessage}
                        authUser={this.authUser} />
                )} />
                <LandingIntro />
            </div>;
        const profile =
            <Profile
                updateUser={this.updateUser}
                createFlashMessage={this.createFlashMessage}
            />;

        const OpenSubscriptions = ({ match }) => (
            isAuthenticated ?
                <div>
                    <h3>{match.params.username}</h3>
                    <Route path="/u/:username/:mode(followers|followin)" render={() => (
                        <Subscriptions
                            user={match.params.username}
                            mode={match.params.mode}
                            createFlashMessage={this.createFlashMessage}
                        />
                    )} />
                </div>
                : <Redirect to={{ pathname: '/' }} />);


        const OpenPost = ({ match }) => (
            <Post id={match.params.id} />);

        const Frame = ({ match }) => (
            <div>
                <div>
                    <Route path="/popular" component={PopularBlock} />
                    <Route path="/u/:username" render={() => (
                        <UserBlock
                            user={match.params.username}
                            is_authenticated={this.state.isAuthenticated}
                            to404={this.to404}
                        />)} />

                </div>
                <div>
                    <Route path="/popular" render={() => (<PostList mode='popular' />)} />
                    <Route path="/u/:username" render={() => (<PostList mode={`user/${match.params.username}`} />)} />
                </div>
            </div>);

        const AuthFrame = ({ match }) => (
            isAuthenticated ?
                <div>
                    <div>
                        <Route path="/mine" component={MineBlock} />
                        <Route path="/search" component={SearchBlock} />
                    </div>
                    <div>
                        <Route path="/mine" render={() => (
                            <PostList mode={`user/${window.localStorage.getItem('username')}`} />)} />
                        <Route path="/search" render={() => (<PostList mode='search' />)} />
                        <Route path="/dashboard" render={() => (<PostList mode='dashboard' />)} />
                    </div>
                </div>
                : <Redirect to={{
                    pathname: '/',
                    state: { referrer: this.props.location.pathname }
                }} />);




        const Modal = ({ match, history, location }) => {
            const back = (e) => {
                e.stopPropagation()
                history.goBack()
            }
            return (
                <div className='modal'>
                    <Paper zDepth={1}>
                        <IconButton onClick={back} >
                            <NavigationCloseIcon />
                        </IconButton>
                        <Route path="/p/:id" render={() => (<Post id={match.params.id} />)} />
                        <Route path="/post" component={PostEditor} />
                        <Route path="/u/:username/:mode(followers|followin)" render={() => (
                            <Subscriptions
                                user={location.state.userid || match.params.username}
                                mode={match.params.mode}
                                createFlashMessage={this.createFlashMessage} />
                        )} />
                    </Paper>
                </div >
            );
        }

        return (
            <MuiThemeProvider>
                <div>
                    <FlashMessages
                        deleteFlashMessage={this.deleteFlashMessage}
                        messages={flashMessages} />
                    <Header
                        user={this.state.user}
                        access={isAuthenticated}
                        redirect={this.redirect}
                        logoutUser={this.logoutUser}
                        drawerToggle={this.drawerToggle} />
                    <AppDrawer open={this.state.drawer} />
                    <div
                        className='frame'
                        style={{ marginLeft: this.state.drawer ? '235px' : '0px' }} >
                        {
                            this.state.is404 ?
                                <Route component={NotFound} /> :
                                <div>
                                    {/* Main switch routing */}
                                    <Switch location={isModal ? this.previousLocation : location}>
                                        /* landing, auth */
                                        <Route exact path='/' render={() => (
                                            !isAuthenticated ? landing
                                                : <Redirect to={
                                                    this.props.location.state == null
                                                        ? '/dashboard'
                                                        : this.props.location.state.referrer
                                                } />)} />
                                        <Route path='/register' render={() => (
                                            isAuthenticated ? <Redirect to='/' /> : landing)} />
                                        <Route path='/login' render={() => (
                                            isAuthenticated ? <Redirect to='/' /> : landing)} />
                                        /* auth paths */
                                        <Route path='/dashboard' component={AuthFrame} />
                                        <Route path='/search/:searchParam?' component={AuthFrame} />
                                        <Route path='/mine' component={AuthFrame} />
                                        <Route path='/profile' render={() => (
                                            isAuthenticated ? profile : <Redirect to='/' />)} />
                                        <Route path='/u/:username/:mode(followers|followin)'
                                            component={OpenSubscriptions} />
                                        <Route path='/post' render={() => (<Redirect to='/' />)} />
                                        /* non auth paths */
                                        <Route path='/popular' component={Frame} />
                                        <Route path='/u/:username' component={Frame} />
                                        <Route path='/p/:id' component={OpenPost} />
                                        /* 404 */
                                        <Route component={NotFound} />
                                    </Switch>
                                    {/* /u/:username(.+/followers|.+/followin) */}
                                    {
                                        isModal ?
                                            // Modal switch routing
                                            <Switch>
                                                /* non auth paths */
                                                <Route path='/p/:id' component={Modal} />
                                                /* auth paths */
                                                <Route path='/post' component={Modal} />
                                                <Route path='/u/:username/:mode(followers|followin)' component={Modal} />
                                            </Switch>
                                            : null
                                    }
                                </div>
                        }
                    </div>

                </div>
            </MuiThemeProvider>
        )
    }
}

export default App
