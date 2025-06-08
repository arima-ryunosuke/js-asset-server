const url = require('url');
const fs = require('fs');
const path = require('path');
const compiler = new (require('../../src/compiler/syntactically-awesome-style-sheet'))();
const workdir = path.normalize((__dirname + '/../../.tmp/assetter-test/syntactically-awesome-style-sheet')).replaceAll('\\', '/');
const options = {
    // dummy
};

fs.mkdirSync(workdir, {recursive: true});

test('compile scss', async () => {
    const input = workdir + '/test.scss';
    const child = workdir + '/_child.scss';
    fs.writeFileSync(input, '@use "child";\nhtml{body{color:child.$color}}');
    fs.writeFileSync(child, '$color: #123456;');
    const result = await compiler.compile(input, Object.assign({}, options, {}));
    expect(result.depends).toHaveLength(2);
    expect(result.depends[0]).toEqual(input);
    expect(result.depends[1]).toEqual(child);
    expect(result.content).toEqual(`html body {\n  color: #123456;\n}\n`);
    expect(result.mapping).toEqual({
        "mappings": "AACK;EAAK,OCDF",
        "names": [],
        "sourceRoot": "",
        "sources": [
            `file:///${workdir}/test.scss`,
            `file:///${workdir}/_child.scss`,
        ],
        "sourcesContent": [
            "@use \"child\";\nhtml{body{color:child.$color}}",
            "$color: #123456;",
        ],
        "version": 3,
    });
});

test('compile scss minify', async () => {
    const input = workdir + '/test.scss';
    const child = workdir + '/_child.scss';
    fs.writeFileSync(input, '@use "child" as C;\nhtml{body{color:C.$color}}');
    fs.writeFileSync(child, '$color: #123456;');
    const result = await compiler.compile(input, Object.assign({}, options, {minified: true}));
    expect(result.depends).toHaveLength(2);
    expect(result.depends[0]).toEqual(input);
    expect(result.depends[1]).toEqual(child);
    expect(result.content).toEqual(`html body{color:#123456}\n`);
    expect(result.mapping).toEqual({
        "mappings": "AACK,gBCDG",
        "names": [],
        "sourceRoot": "",
        "sources": [
            `file:///${workdir}/test.scss`,
            `file:///${workdir}/_child.scss`,
        ],
        "sourcesContent": [
            "@use \"child\" as C;\nhtml{body{color:C.$color}}",
            "$color: #123456;",
        ],
        "version": 3,
    });
});
