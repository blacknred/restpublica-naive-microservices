import React from 'react';
import { Link } from 'react-router-dom';

const back = (e) => {
    e.stopPropagation()
    history.goBack()
}
const NewPost = () => (
    <div style={{ background: '#eee', border: '1px solid #aaa', margin: '0 auto', width: '80%' }} >
        <h1>New Post</h1>
        <button type='button' onClick={back}>
            Close
        </button>
        <Link to='/'><p>Return Home</p></Link>
    </div>
)

export default NewPost  