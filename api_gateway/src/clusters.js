/* Clustering to exploit all the cores of a machine.
Node is single-threaded so it will use by default only 1 core. */

/* eslint-disable global-require */
const cluster = require('cluster');
const debug = require('debug')('api-gateway:clusters');
const cpus = require('os').cpus().length;

if (cluster.isMaster) {
    // Master process
    for (let i = 0; i < cpus; i++) {
        // 1 process per core
        cluster.fork();
    }

    debug('Master process online with PID', process.pid)

    cluster.on('online', (worker) => {
        debug(`Worker ${worker.process.pid} is online`);
    });

    cluster.on('exit', (worker, code, signal) => {
        debug(`Worker ${worker.process.pid} died with code:
        ${code}, and signal: ${signal}`);
        debug('Starting a new worker');
        cluster.fork();
    });
} else {
    // Worker process
    require('./server.js');
}
