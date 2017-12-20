/* eslint-disable no-undef */
import React from 'react';
import { Link } from 'react-router-dom';

import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';

import './UserBlock.css';

const UserBlock = ({ userId, userpic, username, fullname, description, isAuthenticated,
    mode, mySubscriptionId, removeSubscription, createSubscription }) => {

    const userBlockButton = (
        !isAuthenticated ? null :
            mode === 'me' ?
                <FlatButton
                    secondary={true}
                    label={<Link to='/profile'>Edit profile</Link>} />
                :
                mySubscriptionId ?
                    <FlatButton
                        secondary={true}
                        label='Unfollow'
                        onClick={() => removeSubscription(mySubscriptionId, username)} />
                    :
                    <FlatButton
                        secondary={true}
                        label='Follow'
                        onClick={() => createSubscription(userId, username)} />
    );

    return (
        <div className='container'>
            <div className='user-block'>
                <div>
                    <Avatar
                        size={100}
                        src={userpic}
                        alt={username}
                    />
                    <section>
                        <h2>
                            {fullname}
                            <small><small>{' @' + username}</small></small>
                        </h2>
                        {description}
                    </section>
                </div>
                <div>
                    {userBlockButton}
                </div>
            </div>
        </div>
    );
}

export default UserBlock;