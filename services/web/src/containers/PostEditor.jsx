/* eslint-disable no-undef */
import React, { Component } from 'react';

const styles = {
    postEditorContainer: {
        background: '#eee', border: '1px solid #aaa',
        margin: '0 auto', width: '80%'
    }
}

class PostEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            <div style={styles.postEditorContainer}>
                New Post
            </div>
        )
    }

}
export default PostEditor 