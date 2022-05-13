const os = require('os');
const fs = require('fs');
const path = require('path');
const compiler = new (require('../../src/compiler/stylus'))();
const workdir = (os.tmpdir() + '/assetter-test/stylus').replace('\\', '/');
const options = {
    // dummy
};

fs.mkdirSync(workdir, {recursive: true});

test('compile stylus', async () => {
    const input = workdir + '/test.stylus';
    fs.writeFileSync(input, 'html{body{color:red}}');
    const result = await compiler.compile(input, Object.assign({}, options, {}));
    expect(result.depends).toHaveLength(1);
    expect(result.depends[0]).toEqual(input);
    expect(result.content).toEqual(`html body {\n  color: #f00;\n}\n`);
    expect(result.mapping).toEqual({
        "file": "test.css",
        "mappings": "AAAK;EAAK,OAAM,KAAN",
        "names": [],
        "sources": [
            input.substring(2)
        ],
        "sourcesContent": [
            "html{body{color:red}}"
        ],
        "version": 3
    });
});

test('compile stylus minify', async () => {
    const input = workdir + '/test.stylus';
    fs.writeFileSync(input, 'html{body{color:red}}');
    const result = await compiler.compile(input, Object.assign({}, options, {minified: true}));
    expect(result.depends).toHaveLength(1);
    expect(result.depends[0]).toEqual(input);
    expect(result.content).toEqual(`html body{color:#f00}`);
    expect(result.mapping).toEqual({
        "file": "test.css",
        "mappings": "AAAK,UAAK,MAAM",
        "names": [],
        "sources": [
            input.substring(2)
        ],
        "sourcesContent": [
            "html{body{color:red}}"
        ],
        "version": 3
    });
});
