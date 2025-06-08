const fs = require('fs');
const path = require('path');
const processor = new (require('../../src/processor/java-script'))({});
const workdir = path.normalize((__dirname + '/../../.tmp/assetter-test/java-script')).replaceAll('\\', '/');
const options = {
    rootdir: workdir,
    localdir: '/local',
};

fs.mkdirSync(workdir, {recursive: true});

test('process', async () => {
    // dummy
});
