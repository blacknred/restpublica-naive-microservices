import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            username: '',
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
    
    loginSubmit = (event) => { 
        event.preventDefault();
        const userData = {
            'username': this.state.username,
            'password': this.state.password
        };
        return axios.post('http://localhost:3001/api/v1/users/login', userData)
            .then((res) => {
                console.log(res)
                res.data.status === 'Validation failed'
                    ? this.setState({ errors: res.data.failures })
                    : this.props.authUser(res.data.user, 'logged in')
            })
            .catch((error) => {
                this.props.createFlashMessage(error.message, 'error');
            })
    }
    /* eslint-enable */
    
    render() {
        return (
            <div>
                <h2>Login</h2>
                <hr /><br />
                <form
                    onSubmit={this.loginSubmit}>
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
                                return <div key={'d' + error.param}>{error.msg}</div>
                            })
                        }
                    </div>
                    <div>
                        <div>
                            <button
                                type='submit'>
                                Log in
                        </button>&nbsp;
                        <Link to='/'>Cancel</Link>
                            <p>Need to <Link to='/register'>register</Link>?</p>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}

export default LoginForm
