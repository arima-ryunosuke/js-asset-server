const os = require('os');
const fs = require('fs');
const path = require('path');
const compiler = new (require('../../src/compiler/ecma-script'))();
const workdir = (os.tmpdir() + '/assetter-test/ecma-script').replace('\\', '/');
const options = {
    runtime: {},
    nocache: true,
};

fs.mkdirSync(workdir, {recursive: true});

test('compile es', async () => {
    const input = workdir + '/test.es';
    fs.writeFileSync(input, '() => 123');
    const result = await compiler.compile(input, Object.assign({}, options, {}));
    expect(result.depends).toHaveLength(1);
    expect(result.depends[0]).toEqual(input);
    expect(result.content).toEqual(`"use transpile";(function () {return 123;});`);
    expect(result.mapping).toEqual({
        "mappings": "gBAAA,qBAAM,GAAN",
        "names": [],
        "sources": [
            "test.es"
        ],
        "sourcesContent": [
            "() => 123"
        ],
        "version": 3
    });
});

test('compile es minify', async () => {
    const input = workdir + '/test.es';
    fs.writeFileSync(input, '() => {/*comment*/ return 123; }');
    const result = await compiler.compile(input, Object.assign({}, options, {minified: true}));
    expect(result.depends).toEqual([input]);
    expect(result.content).toEqual(`"use transpile";(function(){return 123;});`);
    expect(result.mapping).toEqual({
        "mappings": "gBAAA,WAAM,CAAa,MAAO,IAAP,CAAa,CAAhC",
        "names": [],
        "sources": [
            "test.es"
        ],
        "sourcesContent": [
            "() => {/*comment*/ return 123; }"
        ],
        "version": 3
    });
});

test('compile es runtime', async () => {
    const input = workdir + '/test.es';
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

test('compile es require', async () => {
    const input = workdir + '/test.es';
    const require1 = workdir + '/f1.es';
    const require2 = workdir + '/f2.js';
    fs.writeFileSync(input, 'require("./f1.es");\nrequire("./f2.js")');
    fs.writeFileSync(require1, 'console.log("this is es")');
    fs.writeFileSync(require2, 'console.log("this is js")');
    const result = await compiler.compile(input, Object.assign({}, options));
    expect(result.content).toContain(`console.log("this is es")`);
    expect(result.content).toContain(`console.log("this is js")`);
    expect(result.depends).toContain(input);
    expect(result.depends).toContain(path.normalize(require1));
    expect(result.depends).toContain(path.normalize(require2));
});
