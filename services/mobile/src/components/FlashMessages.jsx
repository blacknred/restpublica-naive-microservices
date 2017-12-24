import React from 'react';

import Snackbar from 'material-ui/Snackbar';

// let alertTypes = {
//     error: { background: 'red' },
//     notice: { background: 'black' },
//     success: { background: 'green' }
// };

const FlashMessages = ({ messages, deleteFlashMessage }) => {
    const Alerts = messages.map((message, index) => {
        return (
            <Snackbar
                key={index}
                //bodyStyle={alertTypes[message.type]}
                open={true}
                message={message.text}
                autoHideDuration={4000}
                action="Close"
                // onActionClick={() => closeHandler(index)}
                onRequestClose={() => deleteFlashMessage(index)}
            />
        )
    })
    return (
        <div>{Alerts}</div>
    )
}

export default FlashMessages
