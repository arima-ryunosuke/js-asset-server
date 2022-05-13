const os = require('os');
const fs = require('fs');
const path = require('path');
const processor = new (require('../../src/processor/cascading-style-sheets'))(['urlhash', 'autoprefixer']);
const workdir = (os.tmpdir() + '/assetter-test/cascading-style-sheets').replace('\\', '/');
const options = {
    rootdir: workdir,
    localdir: '/local',
};

fs.mkdirSync(workdir, {recursive: true});

test('process', async () => {
    fs.mkdirSync(`${workdir}/styles`, {recursive: true});
    fs.mkdirSync(`${workdir}/images`, {recursive: true});
    fs.writeFileSync(`${workdir}/styles/hoge.png`, 'hoge');
    fs.writeFileSync(`${workdir}/images/fuga.png`, 'fuga');
    fs.writeFileSync(`${workdir}/piyo.png`, 'piyo');

    const input = {
        filename: `${workdir}/styles/style.css`,
        content: [
            '.a{background: url(hoge.png)}', '.b{cursor: url("../images/fuga.png")}', '.c{src: url("/local/piyo.png?k=v#hash")}',
        ].join("\n"),
        mapping: {
            "mappings": "",
            "sources": [],
            "version": 3
        },
    };
    const result = await processor.process(input, Object.assign({}, options));
    expect(result.content).toContain(`url(hoge.png?31f30ddbcb1bf8446576f0e64aa4c88a9f055e3c)`);
    expect(result.content).toContain(`url("../images/fuga.png?e86797b125848e625d70987c20e4127bbb3db51a"`);
    expect(result.content).toContain(`url("/local/piyo.png?d44054a3e28a00addf25d0fe5cd7163307fe52ea&k=v#hash"`);
});
