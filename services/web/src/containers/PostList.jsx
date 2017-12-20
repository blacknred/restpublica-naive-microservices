/* eslint-disable no-undef */
import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroller'
import ScrollToTop from 'react-scroll-up';

import './PostList.css';

import PostCard from '../components/PostCard';
import Options from '../components/PostListOptions';

import CircularProgress from 'material-ui/CircularProgress';
import IconButton from 'material-ui/IconButton';

import ImageTuneIcon from 'material-ui/svg-icons/image/tune';
import NavidationArrowUpwardIcon from 'material-ui/svg-icons/navigation/arrow-upward';

const styles = {
    optionsRightPanel: {
        position: 'fixed', display: 'flex', flexDirection: 'column',
        transition: 'right 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'
    },
    backToTop: {
        position: 'static',
    },
    loader: {
        flex: 1, textAlign: 'center'
    }
}

class PostList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: this.props.mode,

            empty: false,
            reload: false,
            hasMore: true,
            posts: [],

            isOptionsOpen: false,
            filter: 'none',
            // temp
            layout: 1,
            runEffect: 1
        }
    }
    handleOptionsOpenToggle = () => {
        this.setState({ isOptionsOpen: !this.state.isOptionsOpen });
    }
    handleFilterChange = (value) => {
        this.setState({ filter: value });
        this.scroll.pageLoaded = 0
        this.setState({ reload: !this.state.reload })
        this.setState({ posts: [], postsCount: 1 })
    }
    getPosts = (page) => {
        const headers = {
            headers: { 'Content-Type': 'application/json' }
        }
        if (window.localStorage.authToken) {
            headers.headers.Authorization = `Bearer ${window.localStorage.authToken}`;
        };
        return axios.get(
            `http://localhost:3002/api/v1/posts/${this.state.mode}?offset=${page}&filter=${this.state.filter}`, headers)
            .then((res) => {
                // console.log(res)
                if (this.props.setPostsCount && page === 1) {
                    this.props.setPostsCount(res.data.data.count)
                }
                if (res.data.data.count === 0) {
                    this.setState({ empty: true, hasMore: false })
                } else {
                    this.setState({ posts: (this.state.posts).concat(res.data.data.posts) });
                }
                if ((this.state.posts).length >= res.data.data.count) {
                    console.log('overflow')
                    this.setState({ hasMore: false });
                }
                console.log(`Posts - page:${page}, count:${res.data.data.count}, length:${this.state.posts.length}`)
            })
            .catch((error) => {
                this.setState({ hasMore: false });
                this.props.createFlashMessage('Server error', 'error');
            })
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
                        Start now with
                        <Link to={{ pathname: '/post', state: { modal: true } }}>
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
        console.log(`${this.props.mode} posts are mounted`)
    }
    render() {
        const posts = this.state.posts.map(post => (
            <PostCard
                key={post.post_id}
                post={post}
            />
        ))
        return (
            this.state.empty ?
                <div className='container'>{this.empty()}</div> :
                <div className='container'>
                    {
                        this.state.posts.length < 30 ? null :
                            <div>
                                <Options
                                    drawer={this.props.drawer}
                                    isOptionsOpen={this.state.isOptionsOpen}
                                    handleFilterChange={this.handleFilterChange}
                                    filter={this.state.filter}
                                    layout={this.state.layout}
                                    runEffect={this.state.runEffect}
                                />
                                <div style={Object.assign({}, styles.optionsRightPanel,
                                    { right: this.props.drawer ? '6%' : '12%' })} >
                                    <IconButton onClick={this.handleOptionsOpenToggle} >
                                        <ImageTuneIcon color={this.state.isOptionsOpen
                                            ? 'rgb(255, 64, 129)' : null} />
                                    </IconButton>
                                    <ScrollToTop
                                        showUnder={460}
                                        style={styles.backToTop}>
                                        <IconButton>
                                            <NavidationArrowUpwardIcon />
                                        </IconButton>
                                    </ScrollToTop>
                                </div>
                            </div>
                    }

                    <InfiniteScroll
                        //key={this.state.reload}
                        ref={(scroll) => { this.scroll = scroll }}
                        className="posts"
                        pageStart={0}
                        initialLoad={true}
                        loadMore={this.getPosts}
                        hasMore={this.state.hasMore}
                        loader={<CircularProgress style={styles.loader} />}
                        useWindow={true}
                        threshold={500} >
                        {posts}
                    </InfiniteScroll>
                </div>
        )
    }
}

export default PostList;
