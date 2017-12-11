import React from 'react';
import { Link } from 'react-router-dom'

import Drawer from 'material-ui/Drawer';
import FlatButton from 'material-ui/FlatButton';

import ActionDashboardIcon from 'material-ui/svg-icons/action/dashboard';
import ActionExploreIcon from 'material-ui/svg-icons/action/explore';
import SocialPersonIcon from 'material-ui/svg-icons/social/person';

const AppDrawer = (props) => {
    return (
        <Drawer
            open={props.open}
            containerStyle={{ background: '#fafafa', width: '235px', boxShadow: 'none', padding: '5em 0'}} >
            <FlatButton
                label={<Link to='/dashboard'>Dashboard</Link>}
                icon={<ActionDashboardIcon />} />
                <br />
            <FlatButton
                label={<Link to='/popular'>Popular</Link>}
                icon={<ActionExploreIcon />} />
                <br />
            <FlatButton
                label={<Link to='/mine'>Mine</Link>}
                icon={<SocialPersonIcon />} />
                <br />
        </Drawer>
    )
}

export default AppDrawer;
