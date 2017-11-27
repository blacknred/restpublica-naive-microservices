import React from 'react';
// import PostCard from './PostCard';

const PostList = (props) => {
    return (
        <div className="text-center">
        <p>Posts</p>
        <br/><br/><br/><br/><br/><br/>
        <br/><br/><br/><br/><br/><br/>
        <br/><br/>v<br/><br/><br/><br/>
        <br/><br/><br/><br/><br/><br/>
        <br/><br/><br/><br/><br/><br/>
        <br/><br/>v<br/><br/><br/><br/>
            {/* {props.movies.map(movie => (
                <PostCard
                    key={movie.imdbID}
                    title={movie.Title}
                    posterUrl={movie.Poster}
                    saveMovie={props.saveMovie}
                />
            ))} */}
        </div>
    )
}

export default PostList;
