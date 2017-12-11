/*eslint-disable no-undef */
import React, { Component } from 'react';
import { Link } from 'react-router-dom'

import MenuItem from 'material-ui/MenuItem';
import Avatar from 'material-ui/Avatar';
import DropDownMenu from 'material-ui/DropDownMenu';
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
import ImageTuneIcon from 'material-ui/svg-icons/image/tune';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            view_val: 1,
            filter_val: 1,
            sort_val: 1,
            settings: false
        }
    }
    handleSortChange(value) { this.setState({ sort_val: value }) };
    handleFilterChange(value) { this.setState({ filter_val: value }) };
    handleSettingsToggle = () => this.setState({ settings: !this.state.settings });
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
                <Toolbar style={{ background: '#FFF', position: 'fixed', top: '0', width: '100%', zIndex: '1400' }}>
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
                            style={{ fontSize: '1.4em', color: '#555' }} />
                        {
                            access ?
                                <form onSubmit={this.searchSubmit}>
                                    <TextField
                                        hintText="Search"
                                        id='searchField'
                                        style={{
                                            width: '450px', height: '36px', lineHeight: '36px',
                                            background: '#eee', padding: '0 1em', marginLeft: '30px'
                                        }}
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
                                {
                                    this.state.settings ?
                                        <div>
                                            <DropDownMenu
                                                value={this.state.sort_val}
                                                onChange={(value) => { this.handleSortChange(++value) }} >
                                                <MenuItem value={1} primaryText="By date" />
                                                <MenuItem value={2} primaryText="Most liked" />
                                                <MenuItem value={3} primaryText="Most commented" />
                                            </DropDownMenu>
                                            <DropDownMenu
                                                value={this.state.filter_val}
                                                onChange={(value) => { this.handleFilterChange(++value) }} >
                                                <MenuItem value={1} primaryText="Any type" />
                                                <MenuItem value={2} primaryText="Text" />
                                                <MenuItem value={3} primaryText="Pictures" />
                                                <MenuItem value={4} primaryText="Gifs" />
                                                <MenuItem value={5} primaryText="Videos" />
                                                <MenuItem value={6} primaryText="Music" />
                                            </DropDownMenu>
                                            <DropDownMenu
                                                value={this.state.sort_val}
                                                onChange={(value) => { this.handleSortChange(++value) }} >
                                                <MenuItem value={1} primaryText="By date" />
                                                <MenuItem value={2} primaryText="Most liked" />
                                                <MenuItem value={3} primaryText="Most commented" />
                                            </DropDownMenu>
                                            <DropDownMenu
                                                value={this.state.filter_val}
                                                onChange={(value) => { this.handleFilterChange(++value) }} >
                                                <MenuItem value={1} primaryText="Any type" />
                                                <MenuItem value={2} primaryText="Text" />
                                                <MenuItem value={3} primaryText="Pictures" />
                                                <MenuItem value={4} primaryText="Gifs" />
                                                <MenuItem value={5} primaryText="Videos" />
                                                <MenuItem value={6} primaryText="Music" />
                                            </DropDownMenu>
                                        </div>
                                        : null
                                }
                                <IconButton
                                    onClick={this.handleSettingsToggle}
                                    iconStyle={this.state.advanced_mode ? { color: 'red' } : {}} >
                                    <ImageTuneIcon />
                                </IconButton>

                                <div>
                                    <FlatButton
                                        label={<Link to='/dashboard'>Dashboard</Link>}
                                        icon={<ActionDashboardIcon />} />
                                    <FlatButton
                                        label={<Link to='/popular'>Popular</Link>}
                                        icon={<ActionExploreIcon />} />
                                    <FlatButton
                                        label={<Link to='/mine'>Mine</Link>}
                                        icon={<SocialPersonIcon />} />
                                </div>

                                <IconMenu
                                    iconButtonElement={
                                        <IconButton style={{ margin: '0', padding: '0px' }}>
                                            <Avatar src={`data:image/png;base64, ${user.pic}`} />
                                        </IconButton>
                                    }
                                    anchorOrigin={{ horizontal: 'middle', vertical: 'bottom' }}
                                    targetOrigin={{ horizontal: 'middle', vertical: 'top' }}
                                    style={{ margin: '0 1.5em', cursor: 'pointer' }} >
                                    <MenuItem>
                                        <Link to='/profile'>Edit profile</Link>
                                    </MenuItem>
                                    <MenuItem primaryText="Help" />
                                    <MenuItem primaryText="Send feedback" />
                                    <MenuItem>
                                        <a href="" onClick={(event) => { logoutUser(event) }}>Sign out</a>
                                    </MenuItem>
                                </IconMenu>

                                <Link to={{ pathname: '/post', state: { modal: true } }} >
                                    <RaisedButton
                                        icon={<ContentCreateIcon />}
                                        secondary={true}
                                        style={{ minWidth: '48px' }} />
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