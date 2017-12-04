import React from 'react';
import { Link } from 'react-router-dom';

const Post = () => (
    <div style={{ background: '#eee', border: '1px solid #aaa', margin: '0 auto', width: '80%' }} >
        <h1>Post</h1>
        <Link to='/'><p>Return Home</p></Link>
    </div>
)

export default Post  