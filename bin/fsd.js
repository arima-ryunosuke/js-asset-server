const {fs, path, logger} = require('../src/util');
const chokidar = require('chokidar');

const transpiler = require('../src/transpiler');

module.exports = function (config) {
    const options = require('../src/configure')(config);

    for (const [localdir, rootdir] of Object.entries(options.routes)) {
        logger.info(`[WATCH] ${rootdir}`);

        chokidar.watch(rootdir, {
            ignoreInitial: true,
            ignored: /(^|[\/\\])\../,
            persistent: true,
            awaitWriteFinish: options.wait,
        }).on('all', (eventName, path) => {
            if (['add', 'change'].includes(eventName) && transpiler.canTranspile(path)) {
                transpiler.transpile(path, Object.assign({}, options, {
                    rootdir: rootdir,
                    localdir: localdir,
                })).catch(e => console.error(e));
            }
        });
    }
};
