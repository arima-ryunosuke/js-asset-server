const {fs, path} = require('../src/util');

const transpiler = require('../src/transpiler');

module.exports = function (config) {
    const options = require('../src/configure')(config);

    const dive = function (dirname, callback) {
        fs.readdir(dirname, {withFileTypes: true}, (err, dirents) => {
            for (const dirent of dirents) {
                const fullpath = path.join(dirname, dirent.name);
                if (dirent.isDirectory()) {
                    dive(fullpath, callback);
                }
                else {
                    callback(fullpath);
                }
            }
        });
    }

    for (const [localdir, rootdir] of Object.entries(options.routes)) {
        const curoptions = Object.assign({}, options, {
            rootdir: rootdir,
            localdir: localdir,
        });
        dive(rootdir, function (path) {
            if (transpiler.canTranspile(path)) {
                transpiler.transpile(path, curoptions).catch(e => console.error(e));
            }
        });
    }
};
