// for resolver: see https://github.com/tailwindlabs/tailwindcss/blob/f0f42f62c042fbcf8209a1f8f0b0a267f225a6ce/packages/%40tailwindcss-node/src/compile.ts#L207C7-L207C15
// - try /tmp/1000/assetter-test/cascading-style-sheets/tailwind/node_modules
// - try /tmp/1000/assetter-test/cascading-style-sheets/node_modules
// - try /tmp/1000/assetter-test/node_modules
// - try /tmp/1000/tailwind/node_modules
// - try /tmp/node_modules
// - try /node_modules
// - try  __dirname + '/../../node_modules'
process.env.NODE_PATH = __dirname + '/../../node_modules';

const fs = require('fs');
const path = require('path');
const processor = new (require('../../src/processor/cascading-style-sheets'))({
    tailwind: {},
    autoprefixer: {
        grid: "autoplace",
    },
    urlhash: {
        supportedProps: [
            'background',
            'background-image',
            'border-image',
            'behavior',
            'list-style',
            'src',
            'cursor',
        ],
    },
});
const workdir = path.normalize((__dirname + '/../../.tmp/assetter-test/cascading-style-sheets')).replaceAll('\\', '/');
const options = {
    rootdir: workdir,
    localdir: '/local',
};

fs.mkdirSync(workdir, {recursive: true});

test('tailwind', async () => {
    fs.mkdirSync(`${workdir}/tailwind`, {recursive: true});

    const input = {
        filename: `${workdir}/tailwind/style.tailwindcss`,
        content: `
@import "tailwindcss";

.apply {
  @apply shadow-lg bg-white rounded-sm mt-4;
}
    `,
        mapping: {
            "mappings": "",
            "sources": [],
            "version": 3,
        },
    };
    const result = await processor.process(input, Object.assign({}, options));
    expect(result.content).toContain(`https://tailwindcss.com`);
    expect(result.content).toContain(`@layer base`);
    expect(result.content).toContain(`@property --tw-shadow`);
    expect(result.content).toContain(`box-shadow: var(--tw-inset-shadow)`);
});

test('urlhash', async () => {
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
            "version": 3,
        },
    };
    const result = await processor.process(input, Object.assign({}, options));
    expect(result.content).toContain(`url(hoge.png?31f30ddbcb1bf8446576f0e64aa4c88a9f055e3c)`);
    expect(result.content).toContain(`url("../images/fuga.png?e86797b125848e625d70987c20e4127bbb3db51a"`);
    expect(result.content).toContain(`url("/local/piyo.png?d44054a3e28a00addf25d0fe5cd7163307fe52ea&k=v#hash"`);
});
