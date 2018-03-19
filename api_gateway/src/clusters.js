const cluster = require('cluster');
const debug = require('debug')('gateway');
const cpus = require('os').cpus();

/* Clustering to exploit all the cores of a machine.
    Node is single-threaded by default */

const workerCount = process.env.WORKER_COUNT || cpus;

if (process.env.NODE_ENV === 'production' && cluster.isMaster) {
    // Master process
    workerCount.forEach(() => cluster.fork());

    debug('Master process online with PID %s', process.pid);

    cluster.on('online', (worker) => {
        debug('Worker %s is online', worker.process.pid);
    });

    cluster.on('exit', (worker, code, signal) => {
        debug('Worker %s died with code: %s and signal: %s',
            worker.process.pid, code, signal);
        debug('Starting a new worker');
        cluster.fork();
    });
} else {
    // Worker process
    require('./server.js'); // eslint-disable-line
}
