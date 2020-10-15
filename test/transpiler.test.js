const os = require('os');
const fs = require('fs');
const path = require('path');
const transpiler = require('../src/transpiler');
const transpile = transpiler.transpile;
const workdir = os.tmpdir() + '/assetter-test';
const options = {
    rootdir: workdir,
    localdir: '/.assetter-test',
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

test('register', async () => {
    const input = workdir + '/custom.txt';
    fs.writeFileSync(input, 'html{body{color:red}}');
    transpiler.regsiter('.txt', {
        postcompile: function (value) {
            value.content = value.content.replace('body', 'BODY');
        },
    }, '.scss');
    expect(transpiler.getAltfile(workdir + '/custom.css')).toEqual(path.resolve(input));
    const result = await transpile(input, Object.assign({}, options, {}));
    expect(result.filename).toEqual(path.resolve(workdir + '/custom.css'));
    expect(result.content).toEqual(`html BODY {
  color: red;
}

/*# sourceMappingURL=custom.css.map */`);
    expect(result.mappath).toEqual(path.resolve(workdir + '/custom.css.map'));
});

test('register string', async () => {
    const input = workdir + '/custom2.hoge';
    fs.writeFileSync(input, 'html{body{color:red}}');
    transpiler.regsiter('.hoge', '.styl');
    expect(transpiler.getAltfile(workdir + '/custom2.css')).toEqual(path.resolve(input));
    const result = await transpile(input, Object.assign({}, options, {}));
    expect(result.filename).toEqual(path.resolve(workdir + '/custom2.css'));
    expect(result.content).toEqual(`html body {
  color: #f00;
}

/*# sourceMappingURL=custom2.css.map */`);
    expect(result.mappath).toEqual(path.resolve(workdir + '/custom2.css.map'));
});

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
});

test('compile scss import', async () => {
    const workdir = os.tmpdir() + '/assetter-test2';
    const input = workdir + '/test.scss';
    fs.mkdirSync(workdir, {recursive: true});
    fs.writeFileSync(input, '@import "child";\nhtml{body{color:$color}}');
    fs.writeFileSync(workdir + '/_child.scss', '$color: #123456;');
    let result = await transpile(input, Object.assign({}, options, {nowrite: false}));
    expect(result.filename).toEqual(path.resolve(workdir + '/test.css'));
    expect(result.content).toContain(`#123456`);
    expect(result.mappath).toEqual(path.resolve(workdir + '/test.css.map'));
    expect(result.mapping.sources).toEqual(["test.scss"]);

    result = await transpile(input, Object.assign({}, options, {nocache: false}));
    expect(result).toBeUndefined();

    fs.writeFileSync(workdir + '/_child.scss', '$color: #654321;');
    result = await transpile(input, Object.assign({}, options, {nocache: false}));
    expect(result).not.toBeUndefined();
    expect(result.content).toContain(`#654321`);
});

test('compile scss url', async () => {
    const input = workdir + '/test.scss';
    const image = workdir + '/hoge.png';
    fs.writeFileSync(input, 'a{background:url(hoge.png)}b{background:url("/hoge.png")}c{background:url("/hoge.png?a=z#iefix")}');
    fs.writeFileSync(image, '');
    let result = await transpile(input, Object.assign({}, options));
    expect(result.content).toContain(`hoge.png?`);
    expect(result.content).toContain(`"/hoge.png?`);
    expect(result.content).toContain(`&a=z#iefix`);
});

test('compile stylus', async () => {
    const input = workdir + '/test.stylus';
    fs.writeFileSync(input, 'html{body{color:red}}');
    const result = await transpile(input, Object.assign({}, options, {}));
    expect(result.filename).toEqual(path.resolve(workdir + '/test.css'));
    expect(result.content).toEqual(`html body {
  color: #f00;
}

/*# sourceMappingURL=test.css.map */`);
    expect(result.mappath).toEqual(path.resolve(workdir + '/test.css.map'));
});

test('compile es', async () => {
    const input = workdir + '/test.es';
    fs.writeFileSync(input, '() => 123');
    const result = await transpile(input, Object.assign({}, options, {}));
    expect(result.filename).toEqual(path.resolve(workdir + '/test.js'));
    expect(result.content).toEqual(`"use transpile";(function () {return 123;});
//# sourceMappingURL=test.js.map`);
    expect(result.mappath).toEqual(path.resolve(workdir + '/test.js.map'));
});

test('compile pattern', async () => {
    const input_ = workdir + '/_test.es';
    fs.writeFileSync(input_, '() => 123');
    const result_ = await transpile(input_, Object.assign({}, options, {patterns: ['!**/_*.es']}));
    expect(result_).toBeUndefined();

    const input = workdir + '/test.es';
    fs.writeFileSync(input, '() => 123');
    const result = await transpile(input, Object.assign({}, options, {patterns: ['!**/_*.es']}));
    expect(result).not.toBeUndefined();
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
    expect(result.mapping.sections[1].offset).toEqual({line: 1, column: 0});
});

test('map: true', async () => {
    const input = workdir + '/test.es';
    fs.writeFileSync(input, '() => 123');
    const result = await transpile(input, Object.assign({}, options, {maps: true}));
    expect(result.mappath).toEqual(`data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QuZXMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6ImdCQUFBLHFCQUFNLEdBQU4iLCJzb3VyY2VzQ29udGVudCI6WyIoKSA9PiAxMjMiXSwiZmlsZSI6Ii8uYXNzZXR0ZXItdGVzdC90ZXN0LmpzIn0=`);
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
