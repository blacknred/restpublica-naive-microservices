import React, { Component } from 'react';
import { Link } from 'react-router-dom'

import './Header.css';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_mode: ''
        }
        this.setModalMode = this.setModalMode.bind(this)
    }
    setModalMode(e, mode) {
        e.preventDefault()
        this.state.modal_mode === mode
        ? this.setState({ modal_mode: '' })
        : this.setState({ modal_mode: mode })
    }
    render() {
        const { logoutUser } = this.props
        const view_settings = <div className='app-header-popup'>view settings</div>;
        const filters_settings = <div className='app-header-popup'>filters settings</div>;
        const sorting_settings = <div className='app-header-popup'>sorting settings</div>;
        const profile_settings = (<div className='app-header-popup'>
            <div>
                <img width="60" src={`data:image/png;base64, ${window.localStorage.getItem('userimg')}`}
                    alt={window.localStorage.getItem('username')} />
                <span>{window.localStorage.getItem('username')}</span>
            </div>
            <br />
            <Link to='/profile'>Edit profile</Link><br />
            <a href="" onClick={(event) => {logoutUser(event)}}>Logout</a>
        </div>);
        // {(event) => { registerSubmit(event) }
        return (
            <div className='app-header'>
                <a href="/">RestPublica</a>
                <span onClick={(event) => { this.setModalMode(event, 'view') }}>
                    <label htmlFor="">* view</label>
                    {this.state.modal_mode === 'view' ? view_settings : null}
                </span>
                <span onClick={(event) => { this.setModalMode(event, 'filters') }}>
                    <label htmlFor="">* filters</label>
                    {this.state.modal_mode === 'filters' ? filters_settings : null}
                </span>
                <span onClick={(event) => { this.setModalMode(event, 'sorting') }}>
                    <label htmlFor="">* sort</label>
                    {this.state.modal_mode === 'sorting' ? sorting_settings : null}
                </span>

                <Link to='/dashboard'>Dashboard</Link>
                <Link to='/popular'>Popular</Link>
                <Link to='/search'>Search</Link>
                <Link to='/mine'>Mine</Link>
                <Link to={{pathname: '/newpost', state: { modal: true }}}>New post</Link>

                <span onClick={(event) => { this.setModalMode(event, 'profile') }} >
                    <img width="35" src={`data:image/png;base64, ${window.localStorage.getItem('userimg')}`}
                        alt={window.localStorage.getItem('username')} />
                    {this.state.modal_mode === 'profile' ? profile_settings : null}
                </span>
            </div>
        )
    }
}

export default Header;