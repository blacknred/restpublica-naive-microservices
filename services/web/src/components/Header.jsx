import React from 'react';
import { Link } from 'react-router-dom'

import MenuItem from 'material-ui/MenuItem';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';
import Badge from 'material-ui/Badge';
import Toggle from 'material-ui/Toggle';
import NavigationMenuIcon from 'material-ui/svg-icons/navigation/menu';
import ContentAddIcon from 'material-ui/svg-icons/content/add';
import SocialNotificationsIcon from 'material-ui/svg-icons/social/notifications';
import SocialNotificationsOffIcon from 'material-ui/svg-icons/social/notifications-off';
import ActionSettingsIcon from 'material-ui/svg-icons/action/settings';

const styles = {
    appbar: {
        background: '#FFF', position: 'fixed', top: '0', width: '100%',
        zIndex: '1400', boxShadow: '0px 4px 8px -3px rgba(17, 17, 17, .06)'
    },
    drawerButton: {
        paddingLeft: '0px'
    },
    toolbarTitle: {
        fontSize: '1.2em', color: '#555', fontWeight: '700'
    },
    searchField: {
        width: '450px', height: '36px', lineHeight: '36px',
        background: '#eee', padding: '0 1em', marginLeft: '40px'
    },
    badge: {
        top: 10, right: 10
    },
    userButton: {
        margin: '0 0 0 12px', padding: '0px'
    },
    iconButton: {
        color: 'rgb(117, 117, 117)'
    },
    userMenu: {
        cursor: 'pointer'
    },
    newPost: {
        minWidth: '48px',
    }
}

const Header = ({ user, logoutUser, isAuthenticated, isNotify, notifications,
    redirect, drawerToggle, notifyToggle, isContentNotFound, toggle404 }) => {
    console.log('header is mounted')

    const handleDrawerToggle = () => drawerToggle();

    const searchSubmit = (event) => {
        event.preventDefault();
        const query = event.target.querySelector('#searchField').value
        if (isContentNotFound) toggle404();
        redirect(`/search?q=${query}`)
    }

    const notifyButton = (
        <Link to='/me/activity'>
            {
                isNotify ?
                    notifications.length ?
                        <Badge
                            badgeContent={notifications.length}
                            secondary={true}
                            badgeStyle={styles.badge}
                            style={{ paddingTop: '20px' }} >
                            <SocialNotificationsIcon style={styles.iconButton} />
                        </Badge>
                        : <IconButton>
                            <SocialNotificationsIcon />
                        </IconButton>
                    : <IconButton >
                        <SocialNotificationsOffIcon />
                    </IconButton>
            }
        </Link>
    );

    const userButton = (
        <IconMenu
            iconButtonElement={
                <IconButton style={styles.userButton}>
                    <Avatar src={`data:image/png;base64, ${user.pic}`} />
                </IconButton>
            }
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            targetOrigin={{ horizontal: 'left', vertical: 'top' }}
            style={styles.userMenu} >
            <MenuItem leftIcon={<ActionSettingsIcon />} >
                <Link to='/profile'>Edit profile</Link>
            </MenuItem>
            <MenuItem>
                <Toggle
                    style={{ paddingTop: 14 }}
                    label="Notifications"
                    defaultToggled={isNotify}
                    onToggle={notifyToggle}
                />
            </MenuItem>
            <MenuItem onClick={logoutUser}>
                Sign out
            </MenuItem>
        </IconMenu>
    );

    const searchBlock = (
        <form onSubmit={searchSubmit}>
            <TextField
                hintText="Search"
                id='searchField'
                style={styles.searchField}
                underlineShow={false}
                hintStyle={{ bottom: '0' }}
            />
        </form>
    );

    return (
        <div>
            <Toolbar style={styles.appbar}>
                <ToolbarGroup>
                    {
                        isAuthenticated ?
                            <IconButton
                                style={styles.drawerButton}
                                onClick={handleDrawerToggle} >
                                <NavigationMenuIcon />
                            </IconButton>
                            : null
                    }
                    <ToolbarTitle
                        text="Restpublica"
                        style={styles.toolbarTitle} />
                    {searchBlock}
                </ToolbarGroup>
                {
                    isAuthenticated ?
                        <ToolbarGroup>
                            <Link to={{ pathname: '/post', state: { modal: true } }}>
                                <FlatButton
                                    label='create'
                                    secondary={true}
                                    style={styles.newPost}
                                    icon={<ContentAddIcon />}
                                />
                            </Link>
                            {notifyButton}
                            {userButton}
                        </ToolbarGroup>
                        : <ToolbarGroup>
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

export default Header;