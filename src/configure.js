const {fs, path, logger} = require('./util');
const os = require('os');

module.exports = function (config) {
    const results = Object.assign({
        // temporary directory (upload file, cache file, or etc)
        tmpdir: os.tmpdir(),
        // mount route
        routes: {
            "/path/to/directory": "fullpath",
            "/path/to/filename.js": ["fullpath1.js", "fullpath2.es"],
        },
        aliases: {},
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

    const routes = {};
    const aliases = {};
    for (const [local, root] of Object.entries(results.routes)) {
        if (root instanceof Array) {
            aliases['/' + local.replace(/\\/g, '/').replace(/^\/|\/$/, '')] = root.map(v => path.resolve(v));
        }
        else {
            routes['/' + local.replace(/\\/g, '/').replace(/^\/|\/$/, '')] = path.resolve(root);
        }
    }
    const maps = {};
    for (const [local, root] of Object.entries(results.maps)) {
        maps['/' + local.replace(/\\/g, '/').replace(/^\/|\/$/, '')] = path.resolve(root);
    }
    results.routes = routes;
    results.aliases = aliases;
    results.maps = maps;

    results.tmpdir = path.resolve(results.tmpdir);

    logger.debug(results);

    results.logger = logger.setLevel(results.loglevel);

    return results;
};
