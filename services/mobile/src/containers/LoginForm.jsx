/*eslint-disable no-undef */
import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            username: '',
            usernameError: '',
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
    loginSubmit = (event) => {
        event.preventDefault();
        const userData = {
            'username': this.state.username,
            'password': this.state.password
        };
        return axios.post('http://localhost:3001/api/v1/users/login', userData)
            .then((res) => {
                console.log(res)
                res.data.status === 'Validation failed' ?
                    res.data.failures.forEach((failure) => {
                        const name = `${failure.param}Error`
                        this.setState({ [name]: failure.msg });
                    })
                    : this.props.authUser(res.data.user, 'logged in')
            })
            .catch((error) => {
                this.props.createFlashMessage(error.message, 'error');
            })
    }

    render() {
        return (
            <form
                onSubmit={this.loginSubmit} >
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
                    id='password'
                    name='password'
                    type="password"
                    hintText="Password Field"
                    value={this.state.password}
                    floatingLabelText="Password"
                    onChange={this.handleInputChange}
                    errorText={this.state.passwordError}
                /><br /><br />
                <FlatButton type='submit' label='Log in' secondary={true} />
                <FlatButton label={<Link to='/register'>Need to register?</Link>} />
                <br /><br />
            </form>
        )
    }
}

export default LoginForm
