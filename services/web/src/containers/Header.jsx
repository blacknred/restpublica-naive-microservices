/*eslint-disable no-undef */
import React, { Component } from 'react';
import { Link } from 'react-router-dom'

import MenuItem from 'material-ui/MenuItem';
import Avatar from 'material-ui/Avatar';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';

import NavigationMenuIcon from 'material-ui/svg-icons/navigation/menu';
import ActionDashboardIcon from 'material-ui/svg-icons/action/dashboard';
import ActionExploreIcon from 'material-ui/svg-icons/action/explore';
import SocialPersonIcon from 'material-ui/svg-icons/social/person';
import ContentCreateIcon from 'material-ui/svg-icons/content/create';
import ActionSettingsIcon from 'material-ui/svg-icons/action/settings';

const styles = {
    appbar : { 
        background: '#FFF', position: 'fixed', top: '0', width: '100%',
        zIndex: '1400', boxShadow: '0px 4px 8px -3px rgba(17, 17, 17, .06)'
    },
    toolbarTitle : { 
        fontSize: '1.3em', color: '#555'
    },
    searchField : {
        width: '450px', height: '36px', lineHeight: '36px',
        background: '#eee', padding: '0 1em', marginLeft: '38px'
    },
    userButton : {
        margin: '0', padding: '0px'
    },
    userMenu : { 
        margin: '0 1.5em', cursor: 'pointer' 
    },
    newPost : { 
        minWidth: '48px'
    }
}

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    handleDrawerToggle = () => this.props.drawerToggle();
    searchSubmit = (event) => {
        event.preventDefault();
        const query = event.target.querySelector('#searchField').value
        this.props.redirect(`/search?q=${query}`)
    }
    componentDidMount() {
        console.log('header mounted')
    }
    render() {
        const { user, logoutUser, access } = this.props
        return (
            <div>
                <Toolbar style={styles.appbar}>
                    <ToolbarGroup>
                        {
                            access ?
                                <IconButton onClick={this.handleDrawerToggle} >
                                    <NavigationMenuIcon />
                                </IconButton>
                                : null
                        }
                        <ToolbarTitle
                            text="Restpublica"
                            style={styles.toolbarTitle} />
                        {
                            access ?
                                <form onSubmit={this.searchSubmit}>
                                    <TextField
                                        hintText="Search"
                                        id='searchField'
                                        style={styles.searchField}
                                        underlineShow={false}
                                        hintStyle={{ bottom: '0' }}
                                    />
                                </form>
                                : null
                        }
                    </ToolbarGroup>
                    {
                        access ?
                            <ToolbarGroup>
                                <div>
                                    <IconButton>
                                        <Link to='/dashboard'><ActionDashboardIcon /></Link>
                                    </IconButton>
                                    <IconButton>
                                        <Link to='/trending'><ActionExploreIcon /></Link>
                                    </IconButton>
                                    <IconButton>
                                        <Link to='/me'><SocialPersonIcon /></Link>
                                    </IconButton>
                                </div>
                                <IconMenu
                                    iconButtonElement={
                                        <IconButton style={styles.userButton}>
                                            <Avatar src={`data:image/png;base64, ${user.pic}`} />
                                        </IconButton>
                                    }
                                    anchorOrigin={{ horizontal: 'middle', vertical: 'bottom' }}
                                    targetOrigin={{ horizontal: 'middle', vertical: 'top' }}
                                    style={styles.userMenu} >
                                    <MenuItem leftIcon={<ActionSettingsIcon />} >
                                        <Link to='/profile'>Edit profile</Link>
                                    </MenuItem>
                                    <MenuItem >
                                        <a href="" onClick={(event) => { logoutUser(event) }}>Sign out</a>
                                    </MenuItem>
                                </IconMenu>
                                <Link to={{ pathname: '/post', state: { modal: true } }} >
                                    <RaisedButton
                                        icon={<ContentCreateIcon />}
                                        secondary={true}
                                        style={styles.newPost} />
                                </Link>
                            </ToolbarGroup>
                            :
                            <ToolbarGroup>
                                <div>
                                    <FlatButton label={<Link to='/login'>Login</Link>} />
                                    <FlatButton label={<Link to='/register'>Register</Link>} />
                                </div>
                            </ToolbarGroup>
                    }
                </Toolbar>
            </div>
        )
    }
}

export default Header;