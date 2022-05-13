const os = require('os');
const fs = require('fs');
const path = require('path');
const compiler = new (require('../../src/compiler/syntactically-awesome-style-sheet'))();
const workdir = (os.tmpdir() + '/assetter-test/syntactically-awesome-style-sheet').replace('\\', '/');
const options = {
    // dummy
};

fs.mkdirSync(workdir, {recursive: true});

test('compile scss', async () => {
    const input = workdir + '/test.scss';
    const child = workdir + '/_child.scss';
    fs.writeFileSync(input, '@import "child";\nhtml{body{color:$color}}');
    fs.writeFileSync(child, '$color: #123456;');
    const result = await compiler.compile(input, Object.assign({}, options, {}));
    expect(result.depends).toHaveLength(2);
    expect(result.depends[0]).toEqual(path.resolve(input));
    expect(result.depends[1]).toEqual(path.resolve(child));
    expect(result.content).toEqual(`html body {\n  color: #123456;\n}\n`);
    expect(result.mapping).toEqual({
        "file": `file:///${workdir}/test.css`,
        "mappings": "AACK;EAAK,OCDF",
        "names": [],
        "sourceRoot": "",
        "sources": [
            `file:///${workdir}/test.scss`,
            `file:///${workdir}/_child.scss`,
        ],
        "sourcesContent": [
            "@import \"child\";\nhtml{body{color:$color}}",
            "$color: #123456;"
        ],
        "version": 3
    });
});

test('compile scss minify', async () => {
    const input = workdir + '/test.scss';
    const child = workdir + '/_child.scss';
    fs.writeFileSync(input, '@import "child";\nhtml{body{color:$color}}');
    fs.writeFileSync(child, '$color: #123456;');
    const result = await compiler.compile(input, Object.assign({}, options, {minified: true}));
    expect(result.depends).toHaveLength(2);
    expect(result.depends[0]).toEqual(path.resolve(input));
    expect(result.depends[1]).toEqual(path.resolve(child));
    expect(result.content).toEqual(`html body{color:#123456}\n`);
    expect(result.mapping).toEqual({
        "file": `file:///${workdir}/test.css`,
        "mappings": "AACK,gBCDG",
        "names": [],
        "sourceRoot": "",
        "sources": [
            `file:///${workdir}/test.scss`,
            `file:///${workdir}/_child.scss`,
        ],
        "sourcesContent": [
            "@import \"child\";\nhtml{body{color:$color}}",
            "$color: #123456;"
        ],
        "version": 3
    });
});
