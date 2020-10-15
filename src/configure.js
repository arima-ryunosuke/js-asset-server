const {fs, path, logger} = require('./util');
const os = require('os');

module.exports = function (config) {
    const results = Object.assign({
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
        // match patterns
        patterns: [],
        // target browser
        browserslist: [],
        // bind address for httpd
        host: '0.0.0.0',
        // listen port for httpd
        port: 8080,
        // awaitWriteFinish for fsd
        wait: true,
        // log level: ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR']
        loglevel: 'INFO',
    }, config);

    for (const [local, root] of Object.entries(results.routes)) {
        delete results.routes[local];
        results.routes['/' + local.replace(/\\/g, '/').replace(/^\/|\/$/, '')] = path.resolve(root);
    }
    for (const [local, root] of Object.entries(results.maps)) {
        delete results.maps[local];
        results.maps['/' + local.replace(/\\/g, '/').replace(/^\/|\/$/, '')] = path.resolve(root);
    }

    results.tmpdir = path.resolve(results.tmpdir);

    logger.debug(results);

    results.logger = logger.setLevel(results.loglevel);

    return results;
};
