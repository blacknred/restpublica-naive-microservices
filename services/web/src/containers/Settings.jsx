/*eslint-disable no-undef */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import CircularProgress from 'material-ui/CircularProgress';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';
import Paper from 'material-ui/Paper';

const styles = {
    profile: { padding: '1em', /*height: '100vh',*/ width: '500px' },
    avatarForm: { display: 'flex', alignItems: 'center', padding: '0 16px' },
    avatar: { marginRight: '1em', cursor: 'pointer' },
    profileForm: { padding: '0 16px' }
}

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            usernameError: '',
            fullname: '',
            fullnameError: '',
            description: '',
            descriptionError: '',
            email: '',
            emailError: '',
            userpic: ''
        };
    }

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
        if (!userPic) return this.props.createFlashMessage('Select an image at first', 'notice')
        const formData = new FormData();
        formData.append('userPic', userPic);
        return axios.put('http://localhost:3001/api/v1/users/update/userpic', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${window.localStorage.authToken}`
            }
        })
            .then((res) => {
                // console.log(res)
                const data = res.data;
                if (res.data.status === 'Validation failed') {
                    this.setState({ errors: data.failures })
                } else {
                    this.props.updateUser({ avatar: data.avatar });
                    this.setState({ userpic: `data:image/png;base64, ${data.avatar}` })
                }
            })
            .catch((error) => {
                this.props.createFlashMessage('Server error', 'error');
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
                // console.log(res)
                res.data.status === 'Validation failed' ?
                    res.data.failures.forEach((failure) => {
                        const name = `${failure.param}Error`
                        this.setState({ [name]: failure.msg });
                    }) :
                    this.props.updateUser(res.data.user.username)
            })
            .catch((error) => {
                this.props.createFlashMessage('Server error', 'error');
            })
    }
    getProfile() {
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
                // console.log(res)
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
                this.props.createFlashMessage('Server error', 'error');
            })
    }

    componentDidMount() {
        console.log('profile is mounted')
        this.getProfile();
    }

    render() {
        const userPicForm = (
            <form
                onSubmit={this.userPicSibmit}
                ref='uploadForm'
                id='uploadForm'
                accept='.jpg, .jpeg, .png'
                encType="multipart/form-data"
                style={styles.avatarForm} >
                <label htmlFor="userPic">
                    <Avatar
                        size={80}
                        src={this.state.userpic}
                        style={styles.avatar} />
                </label>
                <FlatButton
                    label="Choose an Image"
                    containerElement="label" >
                    <input
                        id='userPic'
                        type='file'
                        name='userPic'
                        accept='.jpg, .jpeg, .png'
                        onChange={this.handleInputFileChange} />
                </FlatButton>
                <FlatButton
                    type='submit'
                    label='Update userpic' />
            </form>
        );
        const profileForm = (
            <form
                onSubmit={this.updateSubmit}
                style={styles.profileForm}>
                <TextField
                    id='username'
                    name='username'
                    value={this.state.username}
                    floatingLabelText="Username"
                    fullWidth={true}
                    onChange={this.handleInputChange}
                    errorText={this.state.usernameError}
                /><br />
                <TextField
                    id='fullname'
                    name='fullname'
                    value={this.state.fullname}
                    floatingLabelText="Fullname"
                    fullWidth={true}
                    onChange={this.handleInputChange}
                    errorText={this.state.fullnameError}
                /><br />
                <TextField
                    id='email'
                    name='email'
                    value={this.state.email}
                    floatingLabelText="Email"
                    fullWidth={true}
                    onChange={this.handleInputChange}
                    errorText={this.state.emailError}
                /><br />
                <TextField
                    id='description'
                    name='description'
                    value={this.state.description}
                    floatingLabelText="Description"
                    multiLine={true}
                    fullWidth={true}
                    onChange={this.handleInputChange}
                    errorText={this.state.descriptionError}
                /><br /><br />
                <FlatButton type='submit' label='Update' secondary={true} />
                <FlatButton label={<Link to='/'>Cancel</Link>} />
                <br />
            </form>
        )
        const changePassword = (
            <form>
                <FlatButton label='Change Password' />
            </form>
        )
        return (
            !this.state.fullname.length
                ? <CircularProgress /> :
                <Paper style={styles.profile} transitionEnabled={false}>
                    <Subheader>Avatar</Subheader>
                    {userPicForm}
                    <br />
                    <Divider />
                    <Subheader>Profile</Subheader>
                    {profileForm}
                    <br />
                    <Divider />
                    <Subheader>Password</Subheader>
                    {changePassword}
                </Paper>
        );
    }
}

export default Settings  