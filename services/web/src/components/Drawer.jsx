import React from 'react';
import { Link } from 'react-router-dom'

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
        minHeight: '100%', padding: '4em 0',
        boxShadow: '0px 4px 1px 1px rgba(17, 17, 17, .04)'
    },
    footer: {
        position: 'absolute', padding: '0 1.2em', bottom: '2em',
        color: 'gray', fontSize: '13px'
    }
}

const AppDrawer = (props) => {
    return (
        <Drawer
            open={props.open}
            containerStyle={styles.drawer} >
            <List>
                <Link to='/dashboard'>
                    <ListItem primaryText="Dashboard" leftIcon={<ActionDashboardIcon />} />
                </Link>
                <Link to='/trending'>
                    <ListItem primaryText="Trending" leftIcon={<ActionExploreIcon />} />
                </Link>
                <Link to='/me'>
                    <ListItem primaryText="Mine" leftIcon={<SocialPersonIcon />} />
                </Link>
            </List>
            <Divider />
            <List>
                <Subheader>Subscriptions</Subheader>
                <ListItem primaryText="Dashboard" leftIcon={<ActionDashboardIcon />} />
            </List>
            <Divider />
            <List>
                <ListItem primaryText="Settings" leftIcon={<ActionSettingsIcon />} />
                <ListItem primaryText="Help" leftIcon={<ActionHelpIcon />} />
                <ListItem primaryText="Send feedback" leftIcon={<ActionFeedbackIcon />} />
            </List>
            <Divider />
            <b style={styles.footer}>
                © 2017 Restpublica, LLC
            </b>
        </Drawer>
    )
}

export default AppDrawer;
