const {fs, path, logger} = require('./util');
const os = require('os');

module.exports = function (config) {
    if (config.configured) {
        return config;
    }

    config.daemons = config.daemons ?? {};
    if (config.daemons instanceof Array) {
        config.daemons = Object.fromEntries(config.daemons.map(daemon => [daemon, {}]));
    }

    const results = Object.assign({
        configured: true,
        // support compiler
        compilers: {
            '.es': new (require('./compiler/ecma-script'))(),
            '.es6': new (require('./compiler/ecma-script'))(),

            '.ts': new (require('./compiler/type-script'))(),

            '.sass': new (require('./compiler/syntactically-awesome-style-sheet'))(),
            '.scss': new (require('./compiler/syntactically-awesome-style-sheet'))(),

            '.styl': new (require('./compiler/stylus'))(),
            '.stylus': new (require('./compiler/stylus'))(),

            '.js': new (require('./compiler/ecma-script'))(), // for minify
            '.css': new (require('./compiler/syntactically-awesome-style-sheet'))(), // for minify
        },
        // postprocessor
        processors: {
            '.js': new (require('./processor/java-script'))([]),
            '.css': new (require('./processor/cascading-style-sheets'))(['urlhash', 'autoprefixer']),
        },
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
        // runtime file
        runtime: {
            "js": "", // fullpath
        },
        // match patterns
        patterns: [],
        // minified: false:no minify, true:always, null:by extension
        minified: null,
        // target browser
        browserslist: [],
        // log level: ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR']
        loglevel: 'INFO',
    }, config);

    if (config.daemons.run) {
        config.daemons.run = Object.assign({}, config.daemons.run);
    }
    // @see https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener
    if (config.daemons.httpd) {
        config.daemons.httpd = Object.assign({
            // http/https
            protocol: 'http',
            // bind address
            host: '0.0.0.0',
            // listen port
            port: 8080,
        }, config.daemons.httpd);
    }
    // @see https://nodejs.org/api/https.html#httpscreateserveroptions-requestlistener
    if (config.daemons.httpsd) {
        config.daemons.httpsd = Object.assign({
            // http/https
            protocol: 'https',
            // bind address
            host: '0.0.0.0',
            // listen port
            port: 8443,
            // tls key/cert
            key: undefined,
            cert: undefined,
        }, config.daemons.httpsd);
    }
    // @see https://github.com/paulmillr/chokidar
    if (config.daemons.fsd) {
        config.daemons.fsd = Object.assign({
            awaitWriteFinish: true,}, config.daemons.fsd);
    }

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

    results.normalizePath = function (filename) {
        const parts = path.parse(filename);
        return path.join(parts.dir, path.basename(parts.name, '.min') + parts.ext).replace(/\\/g, '/');
    };

    results.resolvePath = function (filepath) {
        for (const [local, root] of Object.entries(results.routes)) {
            if (filepath.indexOf(local) === 0) {
                return path.join(root, filepath.substring(local.length));
            }
        }
    };

    results.tmpdir = path.resolve(results.tmpdir);

    results.logger = logger.setLevel(results.loglevel);

    results.logger.debug(results);

    return results;
};
