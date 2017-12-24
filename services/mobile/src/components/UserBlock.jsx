/* eslint-disable no-undef */
import React from 'react';
import { Link } from 'react-router-dom';

import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import { grey300, grey400, grey600, grey900 } from 'material-ui/styles/colors';

const UserBlock = ({ userId, userpic, username, fullname, description, isAuthenticated,
    mode, isNightMode, mySubscriptionId, removeSubscription, createSubscription }) => {

    const styles = {
        userBlock: { display: 'flex', justifyContent: 'space-between' },
        left: { display: 'flex', width: '60%', justifyContent: 'space-between' },
        leftInfo: { width: '82%', color: isNightMode ? grey400 : grey600 },
        leftInfoHeader: { fontSize: '1.6em', color: isNightMode ? grey300 : grey900 }
    }

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
            <div style={styles.userBlock}>
                <div style={styles.left}>
                    <Avatar
                        size={90}
                        src={userpic}
                        alt={username}
                    />
                    <section style={styles.leftInfo}>
                        <strong style={styles.leftInfoHeader}>
                            {fullname}
                            <small><small>{' @' + username}</small></small>
                        </strong><br/><br/>
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