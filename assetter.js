#!/usr/bin/env node

const path = require('path');

const config = require('./src/configure.js')(require(path.resolve(process.argv[2])));

const assetter = require('./index.js');
assetter['run'](Object.assign({}, config, {nocache: true}));
assetter['httpd'](config);
