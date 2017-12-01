import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import CircularProgress from 'material-ui/CircularProgress';

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            subscriptions: [],
            username: '',
            fullname: '',
            description: '',
            email: '',
            userpic: ''
        };
    }

    /* eslint-disable */
    handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    handleInputFileChange = (event) => {
        const value = window.URL.createObjectURL(event.target.files[0])
        this.setState({
            userpic: value
        });
    }

    userPicSibmit = (event) => {
        event.preventDefault();
        const userPic = event.target.querySelector('#userPic').files[0];
        if (!userPic) return this.props.createFlashMessage('Select image at first', 'error')
        const formData = new FormData();
        formData.append('userPic', userPic);
        return axios.put('http://localhost:3001/api/v1/users/update/userpic', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${window.localStorage.authToken}`
            }
        })
            .then((res) => {
                console.log(res)
                const data = res.data;
                if (res.data.status === 'Validation failed'){
                    this.setState({ errors: data.failures })
                } else {
                    this.props.updateUser({ avatar: data.avatar });
                    this.setState({userpic: `data:image/png;base64, ${data.avatar}`})
                }
            })
            .catch((error) => {
                this.props.createFlashMessage(error.message, 'error');
            })
    }

    updateSubmit = (event) => {
        event.preventDefault();
        const userData = {
            'username': this.state.username,
            'fullname': this.state.fullname,
            'description': this.state.description,
            'email': this.state.email
        };
        return axios.put('http://localhost:3001/api/v1/users/update', userData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${window.localStorage.authToken}`
            }
        })
            .then((res) => {
                console.log(res)
                const user = res.data.user;
                res.data.status === 'Validation failed'
                    ? this.setState({ errors: res.data.failures })
                    : this.props.updateUser(user.username)
            })
            .catch((error) => {
                this.props.createFlashMessage(error.message, 'error');
            })
    }

    removeSubscription = (event) => {
        const id = event.target.id;
        return axios.delete(`http://localhost:3001/api/v1/users/subscription/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${window.localStorage.authToken}`
            }
        })
            .then((res) => {
                console.log(res)
                this.setState({
                    subscriptions: this.state.subscriptions.filter(sub => {
                        return sub.id != id
                    })
                })
            })
            .catch((error) => {
                this.props.createFlashMessage(error.message, 'error');
            })
    }
    /* eslint-enable */

    getProfileValues() {
        const options = {
            url: 'http://localhost:3001/api/v1/users/profile',
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${window.localStorage.authToken}`
            }
        };
        return axios(options)
            .then((res) => {
                console.log(res)
                const user = res.data.user;
                this.setState({
                    username: user.username,
                    fullname: user.fullname,
                    description: user.description,
                    email: user.email,
                    userpic: `data:image/png;base64, ${user.avatar}`
                });
            })
            .catch((error) => {
                this.props.createFlashMessage(error.message, 'error');
            })
    }

    getSubscriptions() {
        const options = {
            url: 'http://localhost:3001/api/v1/users/subscriptions',
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${window.localStorage.authToken}`
            }
        };
        return axios(options)
            .then((res) => {
                console.log(res)
                this.setState({ subscriptions: res.data.subscriptions })
            })
            .catch((error) => {
                this.props.createFlashMessage(error.message, 'error');
            })
    }

    componentDidMount() {
        this.getProfileValues();
        this.getSubscriptions();
    }

    render() {
        const userPicForm = (
            <form
                onSubmit={this.userPicSibmit}
                ref='uploadForm'
                id='uploadForm'
                accept='.jpg, .jpeg, .png'
                encType="multipart/form-data">
                <div>
                    <label htmlFor="userPic">
                        <img width='60' src={this.state.userpic}
                            alt={this.state.username} />
                    </label>
                    <input
                        id='userPic'
                        type='file'
                        name='userPic'
                        onChange={this.handleInputFileChange} />
                </div>
                <input type='submit' value='Update userpic' />
            </form>
        );
        const profileForm = (
            <form
                onSubmit={this.updateSubmit}>
                <div>
                    <label>Username</label>
                    <div>
                        <input
                            type='text'
                            className='form-control'
                            id='username'
                            name='username'
                            value={this.state.username}
                            onChange={this.handleInputChange} />
                    </div>
                </div>
                <div>
                    <label>Fullname</label>
                    <div>
                        <input
                            type='text'
                            className='form-control'
                            id='fullname'
                            name='fullname'
                            value={this.state.fullname}
                            onChange={this.handleInputChange} />
                    </div>
                </div>
                <div>
                    <label>Description</label>
                    <div>
                        <textarea
                            type='text'
                            className='form-control'
                            id='description'
                            name='description'
                            value={this.state.description}
                            onChange={this.handleInputChange} />
                    </div>
                </div>
                <div>
                    <label>Email</label>
                    <div>
                        <input
                            type='email'
                            className='form-control'
                            id='email'
                            name='email'
                            value={this.state.email}
                            onChange={this.handleInputChange} />
                    </div>
                </div>
                <div>
                    {
                        this.state.errors.map((error) => {
                            return <div key={'t' + error.param}>{error.msg}</div>
                        })
                    }
                </div>
                <div>
                    <div>
                        <button
                            type='submit'>
                            Update
                            </button>&nbsp;
                                <Link to='/'>Cancel</Link>
                    </div>
                </div>
            </form>
        );
        const changePassword = (
            <div>
                <label> Change Password</label>
            </div>
        );
        const subscriptionsBlock = (
            <ul className='subscriptions-block'>
                {
                    this.state.subscriptions.map((sub) => {
                        return <li key={sub.id}>
                            <img src={`data:image/png;base64, ${sub.avatar}`} alt={sub.username} />
                            <label>{sub.username}</label>
                            <button id={sub.id} onClick={this.removeSubscription}>Unfollow</button>
                        </li>
                    })
                }
            </ul >
        );
        return (
            <div className='container'>
                {
                    !this.state.fullname.length && !this.state.subscriptions.length
                        ? <CircularProgress /> :
                        <div className='profile'>
                            <h3>Profile</h3>
                            {userPicForm}
                            <hr />
                            {profileForm}
                            <hr />
                            {changePassword}
                            <hr />
                            <h3>Subscriptions</h3>
                            {subscriptionsBlock}
                        </div>
                }
            </div>
        );
    }
}

export default Profile  