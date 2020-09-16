const os = require('os');
const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpile');
const workdir = os.tmpdir() + '/.assetter-test';
const options = {
    rootdir: workdir,
    localdir: '/.assetter-test',
    tmpdir: os.tmpdir(),
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

test('compile scss', async () => {
    const input = workdir + '/test.scss';
    fs.writeFileSync(input, 'html{body{color:red}}');
    const result = await transpile(input, Object.assign({}, options, {}));
    expect(result.filename).toEqual(path.resolve(workdir + '/test.css'));
    expect(result.content).toEqual(`html body {
  color: red;
}

/*# sourceMappingURL=test.css.map */`);
    expect(result.mappath).toEqual(path.resolve(workdir + '/test.css.map'));
    expect(result.mapping.sources).toEqual(['/.assetter-test/test.scss']);
});

test('compile es', async () => {
    const input = workdir + '/test.es';
    fs.writeFileSync(input, '() => 123');
    const result = await transpile(input, Object.assign({}, options, {}));
    expect(result.filename).toEqual(path.resolve(workdir + '/test.js'));
    expect(result.content).toEqual(`"use transpile";(function () {return 123;});
//# sourceMappingURL=test.js.map`);
    expect(result.mappath).toEqual(path.resolve(workdir + '/test.js.map'));
    expect(result.mapping.sources).toEqual(['/.assetter-test/test.es']);
});

test('compile multi', async () => {
    const input1 = workdir + '/test1.es';
    const input2 = workdir + '/test2.es';
    fs.writeFileSync(input1, '() => 123');
    fs.writeFileSync(input2, '() => 456');
    const result = await transpile([input1, input2], Object.assign({}, options));
    expect(result.filename).toEqual(path.resolve(workdir + '/test1,test2.js'));
    expect(result.content).toEqual(`"use transpile";(function () {return 123;});\n"use transpile";(function () {return 456;});
//# sourceMappingURL=test1,test2.js.map`);
    expect(result.mappath).toEqual(path.resolve(workdir + '/test1,test2.js.map'));
    expect(result.mapping.sections).toHaveLength(2);
    expect(result.mapping.sections[0].offset).toEqual({line: 0, column: 0});
    expect(result.mapping.sections[0].map.sources).toEqual(['/.assetter-test/test1.es']);
    expect(result.mapping.sections[1].offset).toEqual({line: 1, column: 0});
    expect(result.mapping.sections[1].map.sources).toEqual(['/.assetter-test/test2.es']);
});

test('map: true', async () => {
    const input = workdir + '/test.es';
    fs.writeFileSync(input, '() => 123');
    const result = await transpile(input, Object.assign({}, options, {maps: true}));
    expect(result.mappath).toEqual(`data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi8uYXNzZXR0ZXItdGVzdC90ZXN0LmVzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJnQkFBQSxxQkFBTSxHQUFOIiwic291cmNlc0NvbnRlbnQiOlsiKCkgPT4gMTIzIl0sImZpbGUiOiIvLmFzc2V0dGVyLXRlc3QvdGVzdC5qcyJ9`);
});

test('map: false', async () => {
    const input = workdir + '/test.es';
    fs.writeFileSync(input, '() => 123');
    const result = await transpile(input, Object.assign({}, options, {maps: false}));
    expect(result.mappath).toEqual(null);
});

test('map: relative', async () => {
    const input = workdir + '/test.es';
    fs.writeFileSync(input, '() => 123');
    const result = await transpile(input, Object.assign({}, options, {maps: 'relative'}));
    expect(result.content).toEqual(`"use transpile";(function () {return 123;});
//# sourceMappingURL=relative/test.js.map`);
    expect(result.mappath).toEqual(path.resolve(workdir + '/relative/test.js.map'));
});

test('map: {alias: fullpath}', async () => {
    const input = workdir + '/test.es';
    fs.writeFileSync(input, '() => 123');
    const result = await transpile(input, Object.assign({}, options, {maps: {"/map": workdir + '/map'}}));
    expect(result.content).toEqual(`"use transpile";(function () {return 123;});
//# sourceMappingURL=/map/.assetter-test/test.js.map`);
    expect(result.mappath).toEqual(path.resolve(workdir + '/map/.assetter-test/test.js.map'));
});
