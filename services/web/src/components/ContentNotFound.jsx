import React from 'react';

const styles = {
    container: {
        color: '#747474',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        paddingTop: '10%'
    }
}

const ContentNotFound = () => (
    <div style={styles.container}>
        <h2>
            <span>User or post Not Found</span>
        </h2>
    </div>
)

export default ContentNotFound
