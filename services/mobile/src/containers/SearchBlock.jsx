import React, { Component } from 'react';

class SearchBlock extends Component {
    constructor(props) {
        super(props);
        this.state = { term: '' };
    }
    render() {
        return (
            <div className='dynamic-block'>
                <div> Search Block </div>
                <input
                    value={this.state.term}
                    placeholder="Search Posts..."
                    onChange={event => this.setState({ term: event.target.value })}
                />
                <span>
                    <button
                        type="button"
                    // onClick={() => this.props.searchMovie(this.state.term)}
                    >Search!</button>
                </span>
            </div>
        );
    }
}

export default SearchBlock;