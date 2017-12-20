/* eslint-disable no-undef */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Route } from 'react-router-dom'
import axios from 'axios';

import FlatButton from 'material-ui/FlatButton';
import ActionExploreIcon from 'material-ui/svg-icons/action/explore';

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const styles = {
    container: {
        height: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    containerForm: {
        marginTop: '6em',
        padding: '1em 2.5em',
        borderRadius: '1%',
        backgroundColor: 'rgb(250, 250, 250)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    }
}

// Giphy API URL
const giphyURL = encodeURI('https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=fail&rating=pg-13')

class FormIntro extends Component {
    constructor(props) {
        super(props);
        this.state = {
            endpointCounter: 1
        }
    }
    newGif = () => {
        return axios.get(giphyURL, {})
            .then((json) => {
                const gif_url = json.data.data.image_original_url;
                const str = `url("${gif_url}") no-repeat center / cover fixed`;
                this.refs.landing.style.background = str;
            });
    };
    componentDidMount() {
        this.newGif()
    }
    render() {
        const { authUser, createFlashMessage } = this.props;
        return (
            <div style={styles.container} ref='landing'>
                <div style={styles.containerForm} >
                    <h3>Restpublica</h3>
                    <Route path='/login' render={() => (
                        <LoginForm
                            createFlashMessage={createFlashMessage}
                            authUser={authUser} />
                    )} />
                    <Route path='/register' render={() => (
                        <RegisterForm
                            createFlashMessage={createFlashMessage}
                            authUser={authUser} />
                    )} />
                    <br /><br />
                    <FlatButton
                        label={<Link to='/trending'>Explore</Link>}
                        icon={<ActionExploreIcon />}
                    />
                    <br />
                </div>
            </div>
        )
    }
}

export default FormIntro;