/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import axios from 'axios';

import ScrollToTop from 'react-scroll-up';
import InfiniteScroll from 'react-infinite-scroller'
// import InfiniteScrolling from '../components/InfiniteScrolling';
import PostCard from '../components/PostCard';
import Filters from '../components/Filters';

import CircularProgress from 'material-ui/CircularProgress';
import IconButton from 'material-ui/IconButton';

import ImageTuneIcon from 'material-ui/svg-icons/image/tune';
import NavidationArrowUpwardIcon from 'material-ui/svg-icons/navigation/arrow-upward';

const styles = {
    filtersRightPanel: {
        position: 'fixed', display: 'flex', flexDirection: 'column',
        transition: 'right 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'
    },
    backToTop: {
        position: null,
        bottom: null,
        right: null,
        cursor: 'pointer',
        transitionDuration: '0.2s',
        transitionTimingFunction: 'linear',
        transitionDelay: '0s'
    }
}

class PostList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: this.props.mode,
            posts_count: 1,
            posts: [],
            filters: false,
            view_val: 1,
            filter_val: 1,
            sort_val: 1
        }
    }
    handlefiltersToggle = () => this.setState({ filters: !this.state.filters });
    handleFiltersChange = (filter, value) => this.setState({ [filter]: value });
    getPosts = (page) => {
        const headers = {
            headers: { 'Content-Type': 'application/json' }
        }
        if (window.localStorage.authToken) {
            headers.headers.Authorization = `Bearer ${window.localStorage.authToken}`;
        };
        return axios.get(`http://localhost:3002/api/v1/posts/${this.state.mode}?offset=${page}`, headers)
            .then((res) => {
                console.log(res)
                if (page === 1) this.setState({ posts_count: res.data.data.count })
                this.setState({ posts: (this.state.posts).concat(res.data.data.posts) });
            })
            .catch((err) => { console.log(err); })
    }
    empty = () => {
        switch (this.state.mode) {
            case 'dashboard':
                return (
                    <p>
                        Seems like you have not any subscription yet.<br /><br />
                        Start now with <Link to='/trending'><b>Trending</b></Link>.
                    </p>
                );
            case 'trending':
                return (
                    <p>
                        Seems like there is no any post at all.<br /><br />
                        If you are a developer start with posts db populating :)
                    </p>
                );
            case 'me':
                return (
                    <p>
                        Seems like you have no posts yet.<br /><br />
                        Start now with <Link to={{ pathname: '/post', state: { modal: true } }}>
                        <b>Create a post</b></Link>.
                    </p>
                );
            default:
                return (
                    <p>
                        There is no any post yet.
                    </p>
                );
        }
    }
    componentDidMount() {
        console.log(`${this.props.mode} mounted`)
        //this.getPosts(this.props.mode)
    }
    render() {
        const posts = this.state.posts.map(post => (
            <PostCard
                key={post.post_id}
                post={post}
            />
        ))
        return (
            <div className='container'>
                {
                    this.state.posts.length ?
                        <div>
                            <Filters
                                drawer={this.props.drawer}
                                filters={this.state.filters}
                                handleFiltersChange={this.handleFiltersChange}
                                sort_val={this.state.sort_val}
                                filter_val={this.state.filter_val}
                                />
                            <div style={Object.assign({}, styles.filtersRightPanel,
                                { right: this.props.drawer ? '6%' : '12%' })} >
                                <IconButton onClick={this.handlefiltersToggle} >
                                    <ImageTuneIcon color={this.state.filters ? 'rgb(255, 64, 129)' : null} />
                                </IconButton>
                                <ScrollToTop showUnder={460} style={styles.backToTop}>
                                    <IconButton>
                                        <NavidationArrowUpwardIcon />
                                    </IconButton>
                                </ScrollToTop>
                            </div>
                        </div>
                        : null
                }
                {
                    this.state.posts_count > 0 ?
                        <InfiniteScroll
                            className="posts"
                            pageStart={0}
                            loadMore={this.getPosts}
                            hasMore={this.state.posts.length < this.state.posts_count}
                            loader={<CircularProgress />}
                            useWindow={true}
                            threshold={100} >
                            {posts}
                        </InfiniteScroll>
                        // {/* <InfiniteScrolling content={posts} getPosts={this.getPosts} /> */ }
                        : this.empty()
                }
            </div>
        )
    }
}

export default PostList;
