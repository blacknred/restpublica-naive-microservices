/* eslint-disable no-unused-vars */
const path = require('path');
const express = require('express');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const logger = require('morgan');

const authentication = require('./auth/');
const postsRoutes = require('./routes/posts');
const commentsRoutes = require('./routes/comments');
const likesRoutes = require('./routes/likes');
const tagsRoutes = require('./routes/tags');

const app = express();

if (process.env.NODE_ENV !== 'test') app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(expressValidator());

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
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        status: 'error',
        message: err.message
    });
});


module.exports = app;
