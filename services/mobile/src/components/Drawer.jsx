import React from 'react';

import Drawer from 'material-ui/Drawer';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import ActionDashboardIcon from 'material-ui/svg-icons/action/dashboard';
import ActionExploreIcon from 'material-ui/svg-icons/action/explore';
import SocialPersonIcon from 'material-ui/svg-icons/social/person';
import ActionSettingsIcon from 'material-ui/svg-icons/action/settings';
import ActionHelpIcon from 'material-ui/svg-icons/action/help';
import ActionFeedbackIcon from 'material-ui/svg-icons/action/feedback';
import ActionSubjectIcon from 'material-ui/svg-icons/action/subject';
import { grey100, lightBlack, red400 } from 'material-ui/styles/colors';



const AppDrawer = ({ drawer, location, toggle404, isContentNotFound, redirect, isNightMode }) => {
    // console.log('drawer is mounted')

    const styles = {
        drawer: {
            backgroundColor: isNightMode ? lightBlack : grey100, boxShadow: 'none',
            padding: '4em 0 1em 0', justifyContent: 'space-between', width: '240px',
            display: 'flex', flexDirection: 'column', minHeight: '100%'
        },
        listItem: {
            marginLeft: '10px', fontSize: '16px'
        },
        footer: {
            flex: 1, display: 'flex', alignItems: 'flex-end',
            padding: '3em 2em 0 2em', color: 'grey', fontSize: '14px'
        }
    }

    const navigate = (path) => {
        if (isContentNotFound) toggle404();
        redirect(path);
    }

    return (
        <Drawer
            open={drawer}
            containerStyle={styles.drawer} >
            <List>
                <ListItem
                    key={1}
                    innerDivStyle={styles.listItem}
                    primaryText="Dashboard"
                    leftIcon={
                        <ActionDashboardIcon
                            color={location === '/dashboard' ? red400 : null} />
                    }
                    onClick={() => navigate('/dashboard')}
                />
                <ListItem
                    key={2}
                    innerDivStyle={styles.listItem}
                    primaryText="Trending"
                    leftIcon={
                        <ActionExploreIcon
                            color={location === '/trending' ? red400 : null} />
                    }
                    onClick={() => navigate('/trending')}
                />
                <ListItem
                    key={3}
                    innerDivStyle={styles.listItem}
                    primaryText="Subscriptions"
                    leftIcon={
                        <ActionSubjectIcon
                            color={location.match(/^\/subscriptions\/(.)+/) ? red400 : null} />
                    }
                    onClick={() => navigate('/subscriptions')}
                />
                <ListItem
                    key={4}
                    innerDivStyle={styles.listItem}
                    primaryText="Me"
                    leftIcon={
                        <SocialPersonIcon
                            color={location.match(/^\/me\/(.)+/) ? red400 : null} />
                    }
                    onClick={() => navigate('/me')}
                />
            </List>
            <Divider />
            <List>
                <Subheader>Subscriptions</Subheader>
            </List>
            <Divider />
            <List>
                <ListItem
                    key={5}
                    innerDivStyle={styles.listItem}
                    primaryText="Settings"
                    leftIcon={<ActionSettingsIcon />}
                />
                <ListItem
                    key={6}
                    innerDivStyle={styles.listItem}
                    primaryText={
                        <a
                            href="https://github.com/blacknred/restpublica"
                            target="_blank"
                            rel="noopener noreferrer">Help
                            </a>
                    }
                    leftIcon={<ActionHelpIcon />}
                />
                <ListItem
                    key={7}
                    innerDivStyle={styles.listItem}
                    primaryText={
                        <a
                            href="https://github.com/blacknred/restpublica/issues/new"
                            target="_blank"
                            rel="noopener noreferrer">Send feedback
                            </a>
                    }
                    leftIcon={<ActionFeedbackIcon />}
                />
            </List>
            <Divider />
            <Subheader style={styles.footer}><b> © 2017 Restpublica, LLC</b></Subheader>
        </Drawer>
    )
}

export default AppDrawer;
