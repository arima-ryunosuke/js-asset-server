const {fs, path, logger} = require('../src/util');
const chokidar = require('chokidar');

module.exports = function (config) {
    const options = require('../src/configure')(config);
    const transpiler = new (require('../src/transpiler'))(options);

    for (const [localdir, rootdir] of Object.entries(options.routes)) {
        logger.info(`[FSD] ${rootdir}`);

        chokidar.watch(rootdir, Object.assign({
            ignoreInitial: true,
            persistent: true,
        }, options)).on('all', (eventName, path) => {
            logger.debug(`${eventName} ${path}`);
            if (['add', 'change'].includes(eventName) && transpiler.canTranspile(path)) {
                logger.info(`${eventName} ${path}`);
                transpiler.transpile(path, Object.assign({}, options, {
                    rootdir: rootdir,
                    localdir: localdir,
                })).catch(e => logger.error(e));
            }
        });
    }
};
