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
import { grey100, grey200, grey600, grey900, black } from 'material-ui/styles/colors';
import NavigationMenuIcon from 'material-ui/svg-icons/navigation/menu';
import ContentAddIcon from 'material-ui/svg-icons/content/add';
import SocialNotificationsIcon from 'material-ui/svg-icons/social/notifications';
import SocialNotificationsOffIcon from 'material-ui/svg-icons/social/notifications-off';
import ActionSettingsIcon from 'material-ui/svg-icons/action/settings';
import ActionExitToAppIcon from 'material-ui/svg-icons/action/exit-to-app';

const Header = ({ user, logoutUser, isAuthenticated, isNotify, notifications,
    redirect, drawerToggle, notifyToggle, isContentNotFound, toggle404,
    isNightMode, nightModeToggle }) => {
    // console.log('header is mounted')

    const styles = {
        appbar: {
            position: 'fixed', top: '0', width: '100%',
            backgroundColor: isNightMode ? black : 'white',
            zIndex: '1400', boxShadow: '0px 4px 8px -3px rgba(17, 17, 17, .06)'
        },
        drawerButton: { marginLeft: '-10px' },
        drawerButtonIcon: { color: grey600 },
        toolbarTitle: {
            fontSize: '1.2em', marginLeft: '1em', fontWeight: '700',
            color: isNightMode ? grey200 : grey900
        },
        searchField: {
            width: '450px', height: '34px', lineHeight: '34px',
            backgroundColor: isNightMode ? grey900 : grey100,
            padding: '0 1em', marginLeft: '35px',
        },
        searchFieldInput: { color: isNightMode ? grey200 : grey900 },
        badge: { top: '9px', right: '9px' },
        userButton: { margin: '0 0 0 12px', padding: '0px' },
        iconButton: { color: grey600 },
        userMenu: { cursor: 'pointer' },
        newPost: { minWidth: '48px', }
    }
    const handleDrawerToggle = () => drawerToggle();

    const searchSubmit = (event) => {
        event.preventDefault();
        const query = event.target.querySelector('#searchField').value
        if (isContentNotFound) toggle404();
        if (query) redirect(`/search?q=${query}`);
    }

    const notifyButton = (
        <Link to='/me/activity'>
            {
                isNotify ?
                    notifications.length ?
                        <Badge
                            badgeContent={notifications.length}
                            secondary={true}
                            badgeStyle={styles.badge} >
                            <SocialNotificationsIcon style={styles.iconButton} />
                        </Badge>
                        : <IconButton iconStyle={styles.iconButton}>
                            <SocialNotificationsIcon />
                        </IconButton>
                    : <IconButton iconStyle={styles.iconButton}>
                        <SocialNotificationsOffIcon />
                    </IconButton>
            }
        </Link>
    );

    const userButton = (
        <IconMenu
            iconButtonElement={
                <IconButton style={styles.userButton}>
                    <Avatar src={`data:image/png;base64, ${user.pic}`} size={37} />
                </IconButton>
            }
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            targetOrigin={{ horizontal: 'left', vertical: 'top' }}
            style={styles.userMenu} >
            <MenuItem leftIcon={<ActionSettingsIcon />} >
                <Link to='/profile'>Edit profile</Link>
            </MenuItem>
            <MenuItem
                leftIcon={<ActionExitToAppIcon />}
                onClick={logoutUser} >
                Sign out
            </MenuItem>
            <MenuItem>
                <Toggle
                    style={{ paddingTop: 14 }}
                    label="Notifications"
                    defaultToggled={isNotify}
                    toggled={isNotify}
                    onToggle={notifyToggle}
                />
            </MenuItem>
            <MenuItem>
                <Toggle
                    style={{ paddingTop: 14 }}
                    label="Night mode"
                    defaultToggled={isNightMode}
                    toggled={isNightMode}
                    onToggle={nightModeToggle}
                />
            </MenuItem>
        </IconMenu>
    );

    const searchBlock = (
        <form onSubmit={searchSubmit}>
            <TextField
                hintText="Search"
                id='searchField'
                style={styles.searchField}
                inputStyle={styles.searchFieldInput}
                underlineShow={false}
                hintStyle={{ bottom: '0' }}
            />
        </form>
    );

    return (
        <Toolbar style={styles.appbar}>
            <ToolbarGroup>
                {
                    isAuthenticated ?
                        <IconButton
                            style={styles.drawerButton}
                            iconStyle={styles.drawerButtonIcon}
                            onClick={handleDrawerToggle} >
                            <NavigationMenuIcon />
                        </IconButton>
                        : null
                }
                <ToolbarTitle
                    text={<span>REST<small>publica</small></span>}
                    style={styles.toolbarTitle} />
                {searchBlock}
            </ToolbarGroup>
            {
                isAuthenticated ?
                    <ToolbarGroup>
                        <Link to={{ pathname: '/newpost', state: { modal: true } }}>
                            <FlatButton
                                //label='create'
                                //secondary={true}
                                style={styles.newPost}
                                icon={<ContentAddIcon />}
                            />
                        </Link>
                        {notifyButton}
                        {userButton}
                    </ToolbarGroup> :
                    <ToolbarGroup>
                        <Link to='/login'>
                            <FlatButton label='Login' />
                        </Link>
                        <Link to='/register'>
                            <FlatButton label='Register' />
                        </Link>
                    </ToolbarGroup>
            }
        </Toolbar>
    )
}

export default Header;