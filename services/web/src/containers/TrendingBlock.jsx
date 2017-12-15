import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';

import CircularProgress from 'material-ui/CircularProgress';

class TrendingBlock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            authors: [],
            trends: []
        };
    }

    componentDidMount() {
        this.setState({ trends: [''] });
    }

    render() {
        return (
            <div className='container'>
                {
                    !this.state.trends.length
                        ? <CircularProgress /> :
                            <div className='popular-block'>
                                Trends
                                Recommendations peoples
                            </div>
                }
            </div>
        )
    }
}

export default TrendingBlock;