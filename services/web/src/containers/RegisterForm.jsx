/*eslint-disable no-undef */
import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

class RegisterForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            usernameError: '',
            fullname: '',
            fullnameError: '',
            email: '',
            emailError: '',
            password: '',
            passwordError: ''
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
    registerSubmit = (event) => {
        event.preventDefault();
        const userData = {
            'username': this.state.username,
            'fullname': this.state.fullname,
            'email': this.state.email,
            'password': this.state.password
        };
        return axios.post('http://localhost:3001/api/v1/users/register', userData)
            .then((res) => {
                console.log(res)
                res.data.status === 'Validation failed' ?
                    res.data.failures.forEach((failure) => {
                        const name = `${failure.param}Error`
                        this.setState({ [name]: failure.msg });
                    })
                    : this.props.authUser(res.data.user, 'registered')
            })
            .catch((error) => {
                this.props.createFlashMessage(error.message, 'error');
            })
    }

    render() {
        return (
            <form
                onSubmit={this.registerSubmit}>
                <TextField
                    id='username'
                    name='username'
                    value={this.state.username}
                    floatingLabelText="Username"
                    hintText="Username Field"
                    onChange={this.handleInputChange}
                    errorText={this.state.usernameError}
                /><br />
                <TextField
                    id='fullname'
                    name='fullname'
                    value={this.state.fullname}
                    floatingLabelText="Fullname"
                    hintText="Fullname Field"
                    onChange={this.handleInputChange}
                    errorText={this.state.fullnameError}
                /><br />
                <TextField
                    id='email'
                    name='email'
                    type='email'
                    value={this.state.email}
                    floatingLabelText="Email"
                    hintText="Email Field"
                    onChange={this.handleInputChange}
                    errorText={this.state.emailError}
                /><br />
                <TextField
                    id='password'
                    name='password'
                    type="password"
                    hintText="Password Field"
                    value={this.state.password}
                    floatingLabelText="Password"
                    onChange={this.handleInputChange}
                    errorText={this.state.passwordError}
                /><br /><br />
                <FlatButton type='submit' label='Sign up' secondary={true} />
                <FlatButton label={<Link to='/login'>Need to login?</Link>} />
                <br /><br />
            </form>
        )
    }
}

export default RegisterForm
