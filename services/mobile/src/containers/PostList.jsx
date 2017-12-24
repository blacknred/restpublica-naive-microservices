/* eslint-disable no-undef */
import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import moment from 'moment'
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroller'
import ScrollToTop from 'react-scroll-up';

import Options from '../components/PostListOptions';
import { ListItem } from 'material-ui/List';
import { GridList, GridTile } from 'material-ui/GridList';
import CircularProgress from 'material-ui/CircularProgress';
import ImageTuneIcon from 'material-ui/svg-icons/image/tune';
import NavidationArrowUpwardIcon from 'material-ui/svg-icons/navigation/arrow-upward';
import { grey600 } from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';

let countDate = (dateObj => {
    let date = moment.parseZone(dateObj)
    let now = moment().parseZone()
    let res
    if (now.year() > date.year()) res = `${now.year() - date.year()} year`
    else if (now.month() > date.month()) res = `${now.month() - date.month()} month`
    else if (now.date() > date.date() + 7) res = `${(now.date() - date.date()) / 7} week`
    else if (now.date() > date.date()) res = `${now.date() - date.date()} day`
    else if (now.hour() > date.hour()) res = `${date.hour()} hour`
    else if (now.minute() > date.minute()) res = `${date.minute()} min`
    else res = `${date.secounds} sec`
    return res
})

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
        //this.scroll.pageLoaded = 0
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
                // set posts count
                if (this.props.setPostsCount && page === 1) {
                    this.props.setPostsCount(res.data.data.count)
                }
                // if there are no requested posts at all view empty page 
                if (res.data.data.count === 0) {
                    this.setState({ empty: true, hasMore: false })
                }
                // enlarge posts arr if there are, block loading if there are not
                if (res.data.data.posts.length > 0) {
                    this.setState({ posts: this.state.posts.concat(res.data.data.posts) });
                } else {
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
        const { drawer, isFullAccess, isAuthenticated } = this.props;

        const styles = {
            optionsRightPanel: {
                position: 'fixed', display: 'flex', flexDirection: 'column',
                transition: 'right 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'
            },
            backToTop: { position: 'static', },
            loader: { textAlign: 'center', display: 'block', width: '100%' },
            post: { padding: '8px 20px 8px 2px', fontSize: '14px' },
            postSecondary: { lineHeight: '22px', height: 'auto' },
            postIconButton: { padding: '5px 0', width: '18px', height: 'auto' }
        }

        const PostTile = ({ post, index }) => {
            //this.stat = index;
            return (
                <GridTile
                    className='element'
                    cols={index !== 0 && index % 6 === 0 ? 2 : 1}
                    rows={1} >
                    <Link to={{ pathname: `/p/${post.post_id}`, state: { modal: true } }}>
                        {
                            post.thumbs.map((thumb, i) => {
                                return <img src={thumb.url} key={i} alt="" width='100%' height='160' />
                            })
                        }
                    </Link>
                    <ListItem
                        style={styles.post}
                        disabled={true}
                        rightIconButton={!isAuthenticated ? null : rightIconMenu}
                        primaryText={<b>{post.description}</b>}
                        secondaryText={
                            <p style={styles.postSecondary}>
                                {
                                    !post.author ? null :
                                        <Link to={`/u/${post.author.username}`}>
                                            <b>{post.author.username}</b><br />
                                        </Link>
                                }
                                <span>
                                    <span>{post.views} views &#8226; </span>
                                    <span>{post.likes_count} likes &#8226; </span>
                                    <span>{countDate(post.created_at)}</span>
                                </span>
                            </p>
                        }
                        secondaryTextLines={2}
                    />
                </GridTile>
            )

        };

        const filters = (
            this.state.posts.length < 30 ? null :
                <div>
                    <Options
                        drawer={this.drawer}
                        isOptionsOpen={this.state.isOptionsOpen}
                        handleFilterChange={this.handleFilterChange}
                        filter={this.state.filter}
                        layout={this.state.layout}
                        runEffect={this.state.runEffect}
                    />
                    <div style={Object.assign({}, styles.optionsRightPanel,
                        { right: drawer ? '6%' : '12%' })} >
                        <IconButton onClick={this.handleOptionsOpenToggle} >
                            <ImageTuneIcon color={this.state.isOptionsOpen
                                ? grey600 : null} />
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
        )

        const iconButtonElement = (
            <IconButton
                touch={true}
                style={styles.postIconButton}
            >
                <MoreVertIcon color={grey600} />
            </IconButton>
        );

        const rightIconMenu = (
            <IconMenu iconButtonElement={iconButtonElement}>
                {
                    !isFullAccess ?
                        <MenuItem>Repost</MenuItem>
                        :
                        <div>
                            <MenuItem>Edit</MenuItem>
                            <MenuItem>Delete</MenuItem>
                        </div>
                }
            </IconMenu>
        );

        return (
            this.state.empty ?
                <div className='container'>{this.empty()}</div> :
                <div className='container'>
                    {filters}
                    <InfiniteScroll
                        key={this.state.reload}
                        //ref={(scroll) => { this.scroll = scroll; }}
                        pageStart={0}
                        initialLoad={true}
                        loadMore={this.getPosts}
                        hasMore={this.state.hasMore}
                        loader={<CircularProgress style={styles.loader} />}
                        useWindow={true}
                        threshold={500} >
                        <GridList
                            cellHeight={'auto'}
                            cols={6}
                            padding={7}>
                            {this.state.posts.map((post, index) => <PostTile key={index} post={post} index={index} />)}
                        </GridList>
                    </InfiniteScroll>
                </div>
        )
    }
}

export default PostList;
