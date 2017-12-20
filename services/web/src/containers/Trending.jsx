/* eslint-disable no-undef */
import React, { Component } from 'react';

import TrendingBlock from '../components/TrendingBlock';
import UsersBlock from '../components/UsersBlock';
import PostList from './PostList';

class Trending extends Component {
    constructor(props) {
        super(props);
        this.state = { };
    }
    render() {
        return (
            <div>
                <TrendingBlock />
                <UsersBlock />
                <PostList />
            </div>
        )
    }
}

export default Trending;
