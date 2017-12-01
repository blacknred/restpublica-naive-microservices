import React from 'react';

const MovieCard = (props) => {
    const post = props.post
    return (
        <div className='post-card'>
        <p>{post.description}</p>
            {/* <div className='panel panel-info'>
                <div className='panel-heading'>
                    <h3 className='panel-title'>{props.title}</h3>
                </div>
                <div className='panel-body'>
                    <img src={props.posterUrl} alt='Presentation' />
                </div>
                <button
                    className='btn btn-primary btn-sm'
                    onClick={() => props.saveMovie(props.title)}
                >Add to Collection
        </button>
            </div> */}
        </div>
    )
}

export default MovieCard;
