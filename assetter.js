#!/usr/bin/env node

const {fs, path} = require('./src/util');

const configFile = fs.detectSync(['config.js', 'config.json', 'config.dist.js', 'config.dist.json'], process.argv[2]) || process.argv[2];
const config = require('./src/configure.js')(require(path.resolve(configFile)));

if (config.daemons instanceof Array) {
    config.daemons = Object.fromEntries(config.daemons.map(daemon => [daemon, {}]));
}

const assetter = require('./index.js');
for (const [daemon, c] of Object.entries(config.daemons)) {
    assetter[daemon](Object.assign({}, config, c));
}
