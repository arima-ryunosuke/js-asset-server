const os = require('os');
const {fs, path} = require('../src/util');

test('fs.mtime', async () => {
    expect(await fs.promises.mtime('notfound')).toEqual(new Date(0));
});

test('fs.putFile', async () => {
    const target = path.normalize(os.tmpdir() + '/.assetter-fs/sub1/sub2/hoge.txt');
    if (fs.existsSync(target)) {
        await fs.promises.unlink(target);
        await fs.promises.rmdir(path.dirname(target));
    }
    await fs.promises.putFile(os.tmpdir() + '/.assetter-fs/sub1/sub2/hoge.txt');
    expect(fs.existsSync(os.tmpdir() + '/.assetter-fs/sub1/sub2/hoge.txt')).toBeTruthy();
});

test('path.changeExt', async () => {
    expect(path.changeExt('dirname/hoge.txt', '.csv')).toEqual(`dirname${path.sep}hoge.csv`);
    expect(path.changeExt('dirname/hoge.txt', '-min{0}')).toEqual(`dirname${path.sep}hoge-min.txt`);
});

test('path.combineName', async () => {
    expect(path.combineName(',', 'a/b/c/x.txt', 'a/b/c/y.txt', 'a/b/c/z.txt')).toEqual(path.normalize('a/b/c/x,y,z.txt'));
    expect(path.combineName(',', 'a/b/c/x.txt')).toEqual(path.normalize('a/b/c/x.txt'));
});

test('path.separateName', async () => {
    expect(path.separateName(',', 'a/b/c/x,y,z.txt')).toEqual(['a/b/c/x.txt', 'a/b/c/y.txt', 'a/b/c/z.txt'].map(path.normalize));
    expect(path.separateName(',', 'a/b/c/x.txt')).toEqual(['a/b/c/x.txt'].map(path.normalize));
    expect(path.separateName(',', 'a/b/c/x.min.txt,y.csv')).toEqual(['a/b/c/x.min.txt', 'a/b/c/y.csv'].map(path.normalize));
});
