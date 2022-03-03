const os = require('os');
const path = require('path');
const workdir = os.tmpdir() + '/assetter-test';
const configure = require('../src/configure');

test('configured', async () => {
    let config = {};
    expect(configure(config)).not.toStrictEqual(config);
    config = configure(config);
    expect(configure(config)).toStrictEqual(config);
});

test('normalizePath', async () => {
    const configured = configure({
        routes: {
            '/routename': workdir,
        },
    });
    expect(configured.normalizePath('a\\b\\c.min.js')).toEqual('a/b/c.js');
});

test('resolvePath', async () => {
    const configured = configure({
        routes: {
            '/routename': workdir,
        },
    });
    expect(configured.resolvePath('/routename/hoge.js')).toEqual(path.resolve(path.join(workdir, 'hoge.js')));
    expect(configured.resolvePath('/undefined/hoge.js')).toBeUndefined();
});
