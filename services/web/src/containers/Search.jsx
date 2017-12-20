/* eslint-disable no-undef */
import React, { Component } from 'react';

import SearchBlock from '../components/SearchBlock';
import UsersBlock from '../components/UsersBlock';
import PostList from './PostList';

class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: this.props.query
        }
    }
    render() {
        return (
            <div>
                {this.state.query}
                <SearchBlock />
                <UsersBlock />
                <PostList
                    mode={`search${location.search}`}
                    drawer={this.state.drawer}
                    createFlashMessage={this.createFlashMessage} />
                )} />
            </div>
        )
    }
}

export default Search;