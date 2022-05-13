const os = require('os');
const fs = require('fs');
const path = require('path');
const compiler = new (require('../../src/compiler/type-script'))();
const workdir = (os.tmpdir() + '/assetter-test/type-script').replace('\\', '/');
const options = {
    runtime: {},
    nocache: true,
};

fs.mkdirSync(workdir, {recursive: true});

test('compile ts', async () => {
    const input = workdir + '/test.ts';
    fs.writeFileSync(input, '() => 123');
    const result = await compiler.compile(input, Object.assign({}, options, {}));
    expect(result.depends).toHaveLength(1);
    expect(result.depends[0]).toEqual(input);
    expect(result.content).toEqual(`"use transpile";(function () {return 123;});`);
    expect(result.mapping).toEqual({
        "mappings": "gBAAA,qBAAM,GAAN",
        "names": [],
        "sources": [
            "test.ts"
        ],
        "sourcesContent": [
            "() => 123"
        ],
        "version": 3
    });
});

test('compile ts minify', async () => {
    const input = workdir + '/test.ts';
    fs.writeFileSync(input, '() => {/*comment*/ return 123; }');
    const result = await compiler.compile(input, Object.assign({}, options, {minified: true}));
    expect(result.depends).toEqual([input]);
    expect(result.content).toEqual(`"use transpile";(function(){return 123;});`);
    expect(result.mapping).toEqual({
        "mappings": "gBAAA,WAAM,CAAa,MAAO,IAAP,CAAa,CAAhC",
        "names": [],
        "sources": [
            "test.ts"
        ],
        "sourcesContent": [
            "() => {/*comment*/ return 123; }"
        ],
        "version": 3
    });
});

test('compile ts runtime', async () => {
    const input = workdir + '/test.ts';
    const runtime = workdir + '/runtime.js';
    fs.writeFileSync(runtime, '');
    fs.writeFileSync(input, 'class Test {}');
    const result = await compiler.compile(input, Object.assign({}, options, {runtime: {js: runtime}}));
    expect(result.content).toContain(`function Test()`);
    expect(result.content).toContain(`babelHelpers`);
    const runtime_contents = fs.readFileSync(runtime).toString();
    expect(runtime_contents).toContain('babelHelpers');
    expect(runtime_contents).toContain('AsyncGenerator');
});
