const {fs, path, logger} = require('./util');
const os = require('os');

module.exports = function (config) {
    const results = Object.assign({
        // bind address
        host: '0.0.0.0',
        // listen port
        port: 8080,
        // temporary directory (upload file, cache file, or etc)
        tmpdir: os.tmpdir(),
        // mount route
        routes: {
            "/path/to/directory": "fullpath",
        },
        // map directory
        maps: {
            "/path/to/relative": "fullpath",
        },
        // appendix compiler. see transpile.js
        compilers: {},
        // log level: ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR']
        loglevel: 'INFO',
    }, config);

    results.tmpdir = path.resolve(results.tmpdir);

    logger.debug(results);

    results.logger = logger.setLevel(results.loglevel);

    return results;
};
