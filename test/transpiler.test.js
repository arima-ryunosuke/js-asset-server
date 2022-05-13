const os = require('os');
const fs = require('fs');
const path = require('path');
const transpiler = new (require('../src/transpiler'))({
    // support compiler
    compilers: {
        '.in': new (class {
            getOutputExtension() {
                return '.out';
            }

            async compile(input, options) {
                return {
                    depends: [input, input],
                    content: fs.readFileSync(input).toString(),
                    mapping: {
                        "mappings": "",
                        "sources": [],
                        "version": 3
                    },
                };
            }
        })(),
    },
    // postprocessor
    processors: {
        '.out': new (class {
            mappingURL(url) {
                return `\n?${url}`;
            }

            async process(value, options) {
                value.processed = true;
                return value;
            }
        })(),
    },
});
const workdir = os.tmpdir() + '/assetter-test';
const options = {
    rootdir: workdir,
    localdir: '/routename',
    tmpdir: os.tmpdir(),
    patterns: [],
    outfile: null,
    nocache: true,
    nowrite: true,
    logger: {
        log: (...args) => function () {},
        trace: (...args) => function () {},
        debug: (...args) => function () {},
        info: (...args) => function () {},
        warn: (...args) => function () {},
        error: (...args) => function () {},
    },
};

fs.mkdirSync(workdir, {recursive: true});

test('compile pattern', async () => {
    const input_ = workdir + '/_test.in';
    fs.writeFileSync(input_, '');
    const result_ = await transpiler.transpile(input_, Object.assign({}, options, {patterns: ['!**/_*.in']}));
    expect(result_).toBeUndefined();

    const input = workdir + '/test.in';
    fs.writeFileSync(input, '');
    const result = await transpiler.transpile(input, Object.assign({}, options, {patterns: ['!**/_*.in']}));
    expect(result).not.toBeUndefined();
});

test('compile multi', async () => {
    const input1 = workdir + '/test1.in';
    const input2 = workdir + '/test2.in';
    fs.writeFileSync(input1, 'test1');
    fs.writeFileSync(input2, 'test2');
    const result = await transpiler.transpile([input1, input2], Object.assign({}, options));
    expect(result.filename).toEqual(path.resolve(workdir + '/test1,test2.out'));
    expect(result.content).toEqual(`test1\ntest2\n?test1,test2.out.map`);
    expect(result.mappath).toEqual(path.resolve(workdir + '/test1,test2.out.map'));
    expect(result.mapping.sections).toHaveLength(2);
    expect(result.mapping.sections[0].offset).toEqual({line: 0, column: 0});
    expect(result.mapping.sections[1].offset).toEqual({line: 1, column: 0});
});

test('map: true', async () => {
    const input = workdir + '/test.in';
    fs.writeFileSync(input, 'dummy');
    const result = await transpiler.transpile(input, Object.assign({}, options, {maps: true}));
    expect(result.mappath).toEqual(`data:application/json;charset=utf-8;base64,eyJtYXBwaW5ncyI6IiIsInNvdXJjZXMiOltdLCJ2ZXJzaW9uIjozLCJmaWxlIjoiL3JvdXRlbmFtZS90ZXN0Lm91dCJ9`);
});

test('map: false', async () => {
    const input = workdir + '/test.in';
    fs.writeFileSync(input, 'dummy');
    const result = await transpiler.transpile(input, Object.assign({}, options, {maps: false}));
    expect(result.mappath).toEqual(null);
});

test('map: relative', async () => {
    const input = workdir + '/test.in';
    fs.writeFileSync(input, 'dummy');
    const result = await transpiler.transpile(input, Object.assign({}, options, {maps: 'relative'}));
    expect(result.content).toEqual(`dummy\n?relative/test.out.map`);
    expect(result.mappath).toEqual(path.resolve(workdir + '/relative/test.out.map'));
});

test('map: {alias: fullpath}', async () => {
    const input = workdir + '/test.in';
    fs.writeFileSync(input, 'dummy');
    const result = await transpiler.transpile(input, Object.assign({}, options, {maps: {"/map": workdir + '/map'}}));
    expect(result.content).toEqual(`dummy\n?/map/routename/test.out.map`);
    expect(result.mappath).toEqual(path.resolve(workdir + '/map/routename/test.out.map'));
});
