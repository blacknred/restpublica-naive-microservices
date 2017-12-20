/* eslint-disable no-undef */
import React, { Component } from 'react';

const styles = {
    postContainer: {
        background: '#eee', border: '1px solid #aaa',
        margin: '0 auto', width: '80%'
    }
}

class Post extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            <div style={styles.postContainer}>
                Post
            </div>
        )
    }

}
export default Post  