/* Clustering to exploit all the cores of a machine.
(Node is single-threaded by default) */

/* eslint-disable global-require */
const cluster = require('cluster');
const debug = require('debug')('api-gateway');
const cpus = require('os').cpus().length;

if (process.env.NODE_ENV === 'production' && cluster.isMaster) {
    // Master process
    for (let i = 0; i < cpus; i++) {
        // 1 process per core
        cluster.fork();
    }
    console.log('Master process online with PID', process.pid);
    debug('Master process online with PID', process.pid);

    cluster.on('online', (worker) => {
        console.log(`Worker ${worker.process.pid} is online`);
        debug(`Worker ${worker.process.pid} is online`);
    });

    cluster.on('exit', (worker, code, signal) => {
        const f = `Worker ${worker.process.pid} died with code:
        ${code}, and signal: ${signal}`;
        console.log(f);
        debug(f);
        console.log('Starting a new worker');
        debug('Starting a new worker');
        cluster.fork();
    });
} else {
    // Worker process
    require('./server.js');
}
