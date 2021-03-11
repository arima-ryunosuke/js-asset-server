const os = require('os');
const path = require('path');
const workdir = os.tmpdir() + '/assetter-test';
const configure = require('../src/configure')({
    routes: {
        '/routename': workdir,
    },
});

test('normalizePath', async () => {
    expect(configure.normalizePath('a\\b\\c.min.js')).toEqual('a/b/c.js');
});
