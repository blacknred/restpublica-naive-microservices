const http = require('http');
const debug = require('debug')('gateway:server');

const app = require('./app');
const jsCron = require('./cron');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) return val;
    if (port >= 0) return port;
    return false;
}

const port = normalizePort(process.env.PORT || '3000');

function onError(error) {
    if (error.syscall !== 'listen') throw error;
    switch (error.code) {
        case 'EACCES': process.exit(1); break;
        case 'EADDRINUSE': process.exit(1); break;
        default: throw error;
    }
}

const server = http.createServer(app.callback());

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `Pipe ${port}` : `Port ${port}`;
    debug(`Listening on ${bind}`);
    // TODO: separate JSCron to Cron microservice
    jsCron();
}

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);


/*
const https = require('https');
https.createServer(app.callback()).listen(3001);
// SSL Certificate
var options = {
  key: fs.readFileSync(__dirname+'/SSL/cert.key'),
  cert: fs.readFileSync(__dirname+'/SSL/cert.crt')
}
...
*/
