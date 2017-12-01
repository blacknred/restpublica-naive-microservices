import React from 'react';
import { Link } from 'react-router-dom';

const NewPost = () => (
  <div style={{background: '#eee', border: '1px solid #aaa', margin: '0 auto', width: '80%'}} >
    <h1>New Post</h1>
    <Link to='/'><p>Return Home</p></Link>
  </div>
)

export default NewPost 

// saveNewPost(movie) {
//     const options = {
//         url: 'http://localhost:3002/posts/dashboard',
//         method: 'post',
//         data: {
//             title: movie
//         },
//         headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${window.localStorage.authToken}`
//         }
//     };
//     return axios(options)
//         .then((res) => { this.getPosts() })
//         .catch((error) => { console.log(error); })
// }