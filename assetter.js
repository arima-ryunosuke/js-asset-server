#!/usr/bin/env node

const {fs, path} = require('./src/util');

const filename = process.env.ASSETTER_CONFIG ?? 'assetter';
const files = [`${filename}.js`, `${filename}.json`, `${filename}.dist.js`, `${filename}.dist.json`];
const configFile = fs.detectSync(files, process.argv[2]) ?? process.argv[2];
const config = require('./src/configure.js')(require(path.resolve(configFile)));

const assetter = require('./index.js');
for (const [daemon, c] of Object.entries(config.daemons)) {
    assetter[daemon](Object.assign({}, config, c));
}
