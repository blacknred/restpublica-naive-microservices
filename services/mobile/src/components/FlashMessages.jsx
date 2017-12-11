/* eslint-disable no-undef */
import React from 'react';

import Snackbar from 'material-ui/Snackbar';

function alertClass(type = 'success') {
    let classes = {
        error: { background: 'red' },
        notice: { background: 'black' },
        success: { background: 'green' }
    };
    return classes[type];
}

const FlashMessages = ({ messages, deleteFlashMessage }) => {
    const closeHandler = (index) => {
        deleteFlashMessage(index)
    }
    const Alerts = messages.map((message, index) => {
        return (
            <Snackbar
                key={index}
                bodyStyle={alertClass(message.type)}
                open={true}
                message={message.text}
                autoHideDuration={4000}
                action="Close"
                // onActionClick={() => closeHandler(index)}
                onRequestClose={() => closeHandler(index)}
            />
        )
    })
    return (
        <div>
            {Alerts}
        </div>
    )
}

export default FlashMessages
