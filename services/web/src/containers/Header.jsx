import React, { Component } from 'react';
import { Link } from 'react-router-dom'

import AppBar from 'material-ui/AppBar';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import ActionDashboardIcon from 'material-ui/svg-icons/action/dashboard';
import ActionExploreIcon from 'material-ui/svg-icons/action/explore';
import ActionSearchIcon from 'material-ui/svg-icons/action/search';
import ActionSettingsIcon from 'material-ui/svg-icons/action/settings';
import SocialPersonIcon from 'material-ui/svg-icons/social/person';
import ContentCreateIcon from 'material-ui/svg-icons/content/create';
import ContentFilterListIcon from 'material-ui/svg-icons/content/filter-list';

import FontIcon from 'material-ui/FontIcon';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/Toolbar';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            view_val: 3,
            filter_val: 1,
            sort_val: 1
        }
    }
    handleSortChange(event, value) { this.setState({ sort_val: value }) };
    handleFilterChange(event, value) { this.setState({ filter_val: value }) };
    // setModalMode(e, mode) {
    //     e.preventDefault()
    //     this.state.modal_mode === mode
    //         ? this.setState({ modal_mode: '' })
    //         : this.setState({ modal_mode: mode })
    // }
    render() {
        const { user, logoutUser } = this.props
        const view_settings = <div className='app-header-popup'>view settings</div>;
        const filters_settings = <div className='app-header-popup'>filters settings</div>;
        const sorting_settings = <div className='app-header-popup'>sorting settings</div>;
        const profile_settings =
            <div className='app-header-popup'>
                <div>
                    <img width="60" src={`data:image/png;base64, ${user.pic}`}
                        alt={user.name} />
                    <span>{user.name}</span>
                </div>
                <br />
                <Link to='/profile'>Edit profile</Link>
                <br />
                <a href="" onClick={(event) => { logoutUser(event) }}>Logout</a>
            </div>;

        return (
            <Toolbar style={{background: '#FFF'}}>
                <ToolbarGroup firstChild={true} style={{ margin: '0' }} >
                    {/*
                    //<ContentFilterListIcon />
                    <DropDownMenu
                        value={this.state.sort_val}
                        onChange={(event, value) => { this.handleSortChange(event, ++value) }}
                        anchorOrigin={{ horizontal: 'middle', vertical: 'bottom' }}
                        targetOrigin={{ horizontal: 'middle', vertical: 'top' }}
                    >
                        <MenuItem value={1} primaryText="By date" />
                        <MenuItem value={2} primaryText="Most liked" />
                        <MenuItem value={3} primaryText="Most commented" />
                    </DropDownMenu>
                    <DropDownMenu
                        value={this.state.filter_val}
                        onChange={(event, value) => { this.handleFilterChange(event, ++value) }}
                        anchorOrigin={{ horizontal: 'middle', vertical: 'bottom' }}
                        targetOrigin={{ horizontal: 'middle', vertical: 'top' }}
                    >
                        <MenuItem value={1} primaryText="Any type" />
                        <MenuItem value={2} primaryText="Text" />
                        <MenuItem value={3} primaryText="Pictures" />
                        <MenuItem value={4} primaryText="Gifs" />
                        <MenuItem value={5} primaryText="Videos" />
                        <MenuItem value={6} primaryText="Music" />
                    </DropDownMenu>
                    <br/> */}
                    <ToolbarTitle text="Restpublica" style={{ fontSize: '1.4em', color: 'inherit' }} />
                    <FlatButton style={{ margin: '0' }} label={<Link to='/dashboard'>Dashboard</Link>} icon={<ActionDashboardIcon />}></FlatButton>
                    <FlatButton style={{ margin: '0' }} label={<Link to='/popular'>Popular</Link>} icon={<ActionExploreIcon />}></FlatButton>
                    <FlatButton style={{ margin: '0' }} label={<Link to='/search'>Search</Link>} icon={<ActionSearchIcon />}></FlatButton>
                    <FlatButton style={{ margin: '0' }} label={<Link to='/mine'>Mine</Link>} icon={<SocialPersonIcon />}></FlatButton>
                </ToolbarGroup>

                <ToolbarGroup>
                    <FlatButton label={<Link to={{ pathname: '/post', state: { modal: true } }}>Post</Link>} icon={<ContentCreateIcon />}></FlatButton>
                    <IconMenu
                        iconButtonElement={<IconButton><ActionSettingsIcon /></IconButton>}
                        anchorOrigin={{ horizontal: 'middle', vertical: 'bottom' }}
                        targetOrigin={{ horizontal: 'middle', vertical: 'top' }}
                    >
                        <MenuItem primaryText="Refresh" />
                        <MenuItem primaryText="Send feedback" />
                        <MenuItem primaryText="Settings" />
                        <MenuItem primaryText="Help" />
                        <MenuItem primaryText="Sign out" />
                    </IconMenu>
                    <IconMenu
                        iconButtonElement={
                            <img src={`data:image/png;base64, ${user.pic}`}
                                alt={user.name} 
                                style={{ borderRadius: '8%', cursor: 'pointer', width: '36' }}
                            />
                        }
                        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                        targetOrigin={{ horizontal: 'middle', vertical: 'top' }}
                    ><div>{window.localStorage.getItem('username')}</div>
                        <MenuItem><Link to='/profile'>Edit profile</Link></MenuItem>
                        <MenuItem><a href="" onClick={(event) => { logoutUser(event) }}>Logout</a></MenuItem>
                    </IconMenu>
                </ToolbarGroup>
            </Toolbar>
            // <header className='app-header'>
            //     <span onClick={(event) => { this.setModalMode(event, 'view') }}>
            //         <label htmlFor="">* view</label>
            //         {this.state.modal_mode === 'view' ? view_settings : null}
            //     </span>
            //     <span onClick={(event) => { this.setModalMode(event, 'filters') }}>
            //         <label htmlFor="">* filters</label>
            //         {this.state.modal_mode === 'filters' ? filters_settings : null}
            //     </span>
            //     <span onClick={(event) => { this.setModalMode(event, 'sorting') }}>
            //         <label htmlFor="">* sort</label>
            //         {this.state.modal_mode === 'sorting' ? sorting_settings : null}
            //     </span>

            //     <Link to='/dashboard'>Dashboard</Link>
            //     <Link to='/popular'>Popular</Link>
            //     <Link to='/search'>Search</Link>
            //     <Link to='/mine'>Mine</Link>
            //     <Link to={{ pathname: '/post', state: { modal: true } }}>Create post</Link>

            //     <span onClick={(event) => { this.setModalMode(event, 'profile') }} >
            //         <img width="35" src={`data:image/png;base64, ${window.localStorage.getItem('userimg')}`}
            //             alt={window.localStorage.getItem('username')} />
            //         {this.state.modal_mode === 'profile' ? profile_settings : null}
            //     </span>
            // </header>
        )
    }
}

export default Header;