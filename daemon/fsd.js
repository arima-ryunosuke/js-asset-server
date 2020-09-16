const {fs, path, logger} = require('../src/util');
const chokidar = require('chokidar');

const transpile = require('../src/transpile');

module.exports = function (config) {
    const options = require('../src/configure')(config);

    for (const [localdir, rootdir] of Object.entries(options.routes)) {
        logger.info(`[WATCH] ${rootdir}`);

        chokidar.watch(rootdir, {
            ignoreInitial: true,
            ignored: /(^|[\/\\])\../,
            persistent: true,
        }).on('all', (eventName, path) => {
            if (['add', 'change'].includes(eventName)) {
                transpile(path, Object.assign({}, options, {
                    rootdir: rootdir,
                    localdir: localdir,
                })).catch(e => console.error(e));
            }
        });
    }
};
