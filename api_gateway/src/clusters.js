const cluster = require('cluster');
const debug = require('debug')('gateway');
const cpus = require('os').cpus();

if (process.env.NODE_ENV === 'production' && cluster.isMaster) {
    /* Clustering to exploit all the cores of a machine.
    Node is single-threaded by default */
    // Master process: 1 process per core
    cpus.forEach(() => cluster.fork());
    debug('Master process online with PID %s', process.pid);

    cluster.on('online', worker => debug('Worker %s is online', worker.process.pid));

    cluster.on('exit', (worker, code, signal) => {
        debug('Worker %s died with code: %s and signal: %s', worker.process.pid, code, signal);
        debug('Starting a new worker');
        cluster.fork();
    });
} else {
    // Worker process
    require('./server.js'); // eslint-disable-line
}
