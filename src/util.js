exports.fs = (function () {
    const path = require('path');
    const fs = Object.assign({}, require('fs'));
    fs.promises = Object.assign({}, fs.promises);

    fs.detectSync = function (filenames, directory) {
        directory = directory || '';
        for (const filename of filenames) {
            const fullpath = path.resolve(directory, filename);
            if (fs.existsSync(fullpath)) {
                return fullpath;
            }
        }
    };

    fs.promises.mtime = async function (filename) {
        const stat = await this.stat(filename).catch(() => ({mtime: new Date(0)}));
        return stat.mtime;
    };

    fs.promises.putFile = async function (filename, contents) {
        await this.mkdir(path.dirname(filename), {recursive: true});
        return await this.writeFile(filename, contents);
    };

    return fs;
})();

exports.path = (function () {
    const path = Object.assign({}, require('path'));

    path.changeExt = function (filename, ext) {
        const parts = path.parse(filename);
        return path.join(parts.dir, parts.name + ext.replace(/{\d+}/g, parts.ext));
    };

    path.combineName = function (glue, ...filenames) {
        const dir = path.dirname(filenames.reduce(function (p, v) {
            if (path.dirname(p) !== path.dirname(v)) {
                throw new Error('directory is mismatch');
            }
            return v;
        }));
        const ext = path.extname(filenames.reduce(function (p, v) {
            if (path.extname(p) !== path.extname(v)) {
                throw new Error('extension is mismatch');
            }
            return v;
        }));
        return path.join(dir, filenames.map(filename => path.parse(filename).name).join(glue) + ext);
    };

    path.separateName = function (glue, filename) {
        const parts = path.parse(filename);
        return parts.base.split(glue).map(function (v) {
            const nv = path.parse(v);
            return path.join(parts.dir, nv.name + (nv.ext || parts.ext));
        });
    };

    return path;
})();

exports.logger = (function () {
    const logger = Object.assign({}, console);
    //const logger = new console.Console({
    //    stdout: process.stdout,
    //    stderr: process.stderr,
    //});

    const levels = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR'];
    logger.level = levels;
    logger.setLevel = function (level) {
        if (!(level instanceof Array)) {
            level = levels.slice(levels.indexOf(level));
        }
        logger.level = level;
        return logger;
    };

    const original = {
        '': logger.log,
        LOG: logger.log,
        TRACE: logger.trace,
        DEBUG: logger.debug,
        INFO: logger.info,
        WARN: logger.warn,
        ERROR: logger.error,
    };

    const output = function (level, args) {
        if (level && !logger.level.includes(level)) {
            return;
        }
        if (args.length > 0) {
            const now = new Date();
            const Y = now.getFullYear();
            const m = ('0' + (now.getMonth() + 1)).slice(-2);
            const d = ('0' + now.getDate()).slice(-2)
            const H = ('0' + now.getHours()).slice(-2);
            const i = ('0' + now.getMinutes()).slice(-2);
            const s = ('0' + now.getSeconds()).slice(-2);
            const v = ('00' + now.getMilliseconds()).slice(-3);
            const label = level ? ` [${level}]` : '';
            const prefix = `[${Y}/${m}/${d} ${H}:${i}:${s}.${v}]${label}`;
            if (typeof (args[0]) == "string" || args[0] instanceof String) {
                args[0] = prefix + ' ' + args[0];
            }
            else {
                args.unshift(prefix);
            }
        }
        return original[level].apply(logger, args);
    };

    logger.log = (...args) => output('', args);
    logger.trace = (...args) => output('TRACE', args);
    logger.debug = (...args) => output('DEBUG', args);
    logger.info = (...args) => output('INFO', args);
    logger.warn = (...args) => output('WARN', args);
    logger.error = (...args) => output('ERROR', args);

    return logger;
})();
