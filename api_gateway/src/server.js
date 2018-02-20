const app = require('./app');
const debug = require('debug')('api-gateway:server');

function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) { return val; }
    if (port >= 0) { return port; }
    return false;
}

const port = normalizePort(process.env.PORT || '3003');

function onError(error) {
    if (error.syscall !== 'listen') { throw error; }
    switch (error.code) {
        case 'EACCES':
            process.exit(1);
            break;
        case 'EADDRINUSE':
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    const addr = app.address();
    const bind = typeof addr === 'string' ? `Pipe ${port}` : `Port ${port}`;
    debug(`Listening on ${bind}`);
}

app.listen(port);
app.on('error', onError);
app.on('listening', onListening);


/*
// SSL Certificate
var options = {
  key: fs.readFileSync(__dirname+'/SSL/cert.key'),
  cert: fs.readFileSync(__dirname+'/SSL/cert.crt')
}
...
*/
