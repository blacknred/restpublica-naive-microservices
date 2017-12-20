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

const styles = {
    drawer: {
        background: 'rgb(245, 245, 245)', width: '235px',
        padding: '4em 0 2em 0', justifyContent: 'space-between',
        boxShadow: '0px 4px 1px 1px rgba(17, 17, 17, .04)',
        display: 'flex', flexDirection: 'column', minHeight: '100%',
    },
    listItem: {
        marginLeft: '14px'
    },
    footer: {
        padding: '3em 2em 0 2em', color: 'gray', fontSize: '14px'
    }
}

const AppDrawer = ({ drawer, location, toggle404, isContentNotFound, redirect}) => {
    console.log('drawer is mounted')

    const navigate = (path) => {
        if (isContentNotFound) toggle404();
        redirect(path);
    }

    return (
        <Drawer
            open={drawer}
            containerStyle={styles.drawer} >
            <div>
                <List>
                    <ListItem
                        innerDivStyle={styles.listItem}
                        primaryText="Dashboard"
                        leftIcon={
                            <ActionDashboardIcon
                                color={location === '/dashboard' ? 'red' : null} />
                        }
                        onClick={() => navigate('/dashboard')}
                    />
                    <ListItem
                        innerDivStyle={styles.listItem}
                        primaryText="Trending"
                        leftIcon={
                            <ActionExploreIcon
                                color={location === '/trending' ? 'red' : null} />
                        }
                        onClick={() => navigate('/trending')}
                    />
                    <ListItem
                        innerDivStyle={styles.listItem}
                        primaryText="Mine"
                        leftIcon={
                            <SocialPersonIcon
                                color={location.match(/^\/me\/(.)+/) ? 'red' : null} />
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
                        innerDivStyle={styles.listItem}
                        primaryText="Settings"
                        leftIcon={<ActionSettingsIcon />}
                    />
                    <ListItem
                        innerDivStyle={styles.listItem}
                        primaryText="Help"
                        leftIcon={<ActionHelpIcon />}
                    />
                    <ListItem
                        innerDivStyle={styles.listItem}
                        primaryText="Send feedback"
                        leftIcon={<ActionFeedbackIcon />}
                    />
                </List>
                <Divider />
            </div>
            <b style={styles.footer}>
                © 2017 Restpublica, LLC
            </b>
        </Drawer>
    )
}

export default AppDrawer;
