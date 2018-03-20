const logger = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const debug = require('debug')('posts-api');
const useragent = require('express-useragent');
const expressValidator = require('express-validator');
const tagsRoutes = require('./routes/tags');
const { authentication } = require('./auth');
const postsRoutes = require('./routes/posts');
const likesRoutes = require('./routes/likes');
const commentsRoutes = require('./routes/comments');

const app = express();

if (process.env.NODE_ENV !== 'test') app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(expressValidator());
app.use(useragent.express());

/* auth */
app.use(authentication);

/* router */
app.get('/v1/ping', res => res.status(200).send('pong'));
app.use('/v1/posts', postsRoutes);
app.use('/v1/posts', commentsRoutes);
app.use('/v1/posts', likesRoutes);
app.use('/v1/tags', tagsRoutes);

/* 404 and errors handling */
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use((err, req, res) => {
    debug(err.message);
    res.status(err.status || 500);
    res.json({
        status: 'error',
        message: err.message
    });
});


module.exports = app;
