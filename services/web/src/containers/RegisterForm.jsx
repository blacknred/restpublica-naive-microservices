import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

class RegisterForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            username: '',
            fullname: '',
            email: '',
            password: ''
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
                res.data.status === 'Validation failed'
                    ? this.setState({ errors: res.data.failures })
                    : this.props.authUser(res.data.user, 'registered')
            })
            .catch((error) => {
                this.props.createFlashMessage(error.message, 'error');
            })
    }
    /* eslint-enable */

    render() {
        return (
            <div>
                <h2>Register</h2>
                <hr /><br />
                <form
                    onSubmit={this.registerSubmit}>
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
                        <label>Password</label>
                        <div>
                            <input
                                type='text'
                                className='form-control'
                                id='password'
                                name='password'
                                value={this.state.password}
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
                                Sign up
                                </button>&nbsp;
                                <Link to='/'>Cancel</Link>
                            <p>Already registered? <Link to='/login'>Log in</Link></p>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}

export default RegisterForm
