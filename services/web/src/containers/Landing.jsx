import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom'

import RegisterForm from '../components/RegisterForm';
import FormIntro from '../components/FormIntro';
import LoginForm from '../components/LoginForm';

const Landing = (props) => {
    const loginForm = <LoginForm
        createFlashMessage={props.createFlashMessage}
        authUser={props.authUser}
    />
    const registerForm = <RegisterForm
        createFlashMessage={props.createFlashMessage}
        authUser={props.authUser}
    />
    return (
        <div>
            <Switch>
                <Route exact path='/login' render={() => (loginForm)} />
                <Route path='/register' render={() => (registerForm)} />
                <Route path='/' render={() => (
                    <Redirect to={{ pathname: '/login' }} />
                )} />
            </Switch>
            <FormIntro />
        </div>
    )
}

export default Landing;