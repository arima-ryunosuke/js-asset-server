const os = require('os');
const fs = require('fs');
const path = require('path');
const processor = new (require('../../src/processor/java-script'))([]);
const workdir = (os.tmpdir() + '/assetter-test/java-script').replace('\\', '/');
const options = {
    rootdir: workdir,
    localdir: '/local',
};

fs.mkdirSync(workdir, {recursive: true});

test('process', async () => {
    // dummy
});
