const {fs, path} = require('./util');
const minimatch = require('minimatch');

module.exports = class {
    metadata = {};
    compilers = {};
    processors = {};

    constructor(options) {
        this.compilers = options.compilers;
        this.processors = options.processors;
    }

    getAltfile(filename, forced = false) {
        const parts = path.parse(filename);
        const basename = path.join(parts.dir, path.basename(parts.name, '.min'));
        const minified = forced || parts.name.endsWith('.min');

        for (const [inputExt, compiler] of Object.entries(this.compilers)) {
            if (compiler.getOutputExtension() === parts.ext) {
                if (minified || inputExt !== parts.ext) {
                    const altfile = basename + inputExt;
                    if (fs.existsSync(altfile)) {
                        return altfile;
                    }
                }
            }
        }
        return null;
    }

    canTranspile(filename) {
        const parts = path.parse(filename);
        const minified = parts.name.endsWith('.min');

        if (minified) {
            return false;
        }

        return !!this.compilers[parts.ext];
    }

    async compile(altfile, options) {
        altfile = path.resolve(altfile);

        for (const pattern of options.patterns) {
            if (!minimatch(altfile, pattern)) {
                options.logger.info(`skip ${altfile} (no match)`);
                return;
            }
        }

        const parts = path.parse(altfile);
        const compiler = this.compilers[parts.ext];
        if (!compiler) {
            options.logger.info(`skip ${altfile} (not supported)`);
            return;
        }

        const outfile = path.resolve(options.outfile || path.changeExt(altfile, (options.minified ? '.min' : '') + compiler.getOutputExtension()));
        const cachefile = path.join(options.tmpdir, 'assetter', 'transpiled', altfile.replace(':', ';') + '.min-' + options.minified + '.json');

        // for skip
        if (options.minified && parts.name.endsWith('.min')) {
            options.logger.info(`skip ${altfile} (already minified)`);
            return;
        }
        if (outfile === altfile) {
            options.logger.info(`skip ${altfile} (same file)`);
            return;
        }

        if (options.nocache) {
            delete this.metadata[altfile];
        }
        const altmtime = Math.max(options.altmtime, ...await Promise.all((this.metadata[altfile]?.depends ?? []).map(v => fs.promises.mtime(v))));

        if (!options.nocache && (await fs.promises.mtime(outfile) > altmtime)) {
            options.logger.info(`skip ${altfile} (not modified)`);
            return;
        }

        const starttime = Date.now();

        // for cache
        if (!options.nocache && await fs.promises.mtime(cachefile) > altmtime) {
            const value = JSON.parse((await fs.promises.readFile(cachefile)).toString());
            options.logger.info(`cache ${altfile} (${Date.now() - starttime}ms)`);
            return value;
        }

        // for compile
        const value = await compiler.compile(altfile, options).catch(function (error) {
            options.logger.info(`fail ${altfile} (${Date.now() - starttime}ms)`);
            throw error;
        })
        value.filename = outfile;
        value.mapping.file = path.join(options.localdir, path.relative(options.rootdir, outfile)).replace(/\\/g, '/');
        const relative = path.relative(options.rootdir, altfile);
        if (relative.startsWith('..')) {
            value.mapping.sources = [path.basename(altfile)];
        }

        await fs.promises.putFile(cachefile, JSON.stringify(value));
        options.logger.info(`done ${altfile} (${Date.now() - starttime}ms)`);

        this.metadata[altfile] = Object.assign({}, this.metadata[altfile], {depends: value.depends});

        return value;
    }

    async transpile(altfile, options = {}) {
        options = Object.assign({}, {
            maps: "",        // "": same location, string: specify relative, true: data URI, false: no map file, object: see code
            outfile: null,   // output filename (null: same direcotry)
            minified: false, // true: minify, false: human readable, null: auto detect by outfile
            nocache: false,  // true: nouse cache file
            nowrite: false,  // true: nowriting file
            logger: console, // logger instance
        }, options);

        if (options.minified == null) {
            if (options.outfile) {
                options.minified = path.parse(options.outfile).name.endsWith('.min');
            }
            else {
                options.minified = false;
            }
        }

        if (!(altfile instanceof Array)) {
            altfile = [altfile];
        }

        options.altmtime = Math.max(...await Promise.all(altfile.map(v => fs.promises.mtime(v))));
        const values = (await Promise.all(altfile.map(file => this.compile(file, options)))).filter(v => v);
        if (!values.length) {
            return;
        }

        // https://qiita.com/kozy4324/items/1a0f5c1269eafdebd3f8
        const compiled = {
            filename: options.outfile || path.combineName(',', ...values.map(v => v.filename)) || 'combined' + path.extname(values[0].filename),
            content: values.map(v => v.content).join("\n"),
            mapping: values.length === 1 ? values[0].mapping : {
                version: 3,
                sections: values.map((v, i) => ({
                    offset: {
                        line: values[i - 1] ? values[i - 1].content.split("\n").length : 0,
                        column: 0,
                    },
                    map: v.mapping,
                })),
            },
        };

        const processor = this.processors[path.extname(compiled.filename)];
        await processor.process(compiled, options);

        const results = [];
        const writeFile = function (filename, content) {
            if (!options.nowrite) {
                results.push(fs.promises.putFile(filename, content).then(function () {
                    options.logger.info(`write ${filename}`);
                }));
            }
        };

        if (options.maps === true) {
            const map = Buffer.from(JSON.stringify(compiled.mapping)).toString('base64');
            compiled.mappath = `data:application/json;charset=utf-8;base64,` + map;
            writeFile(compiled.filename, compiled.content += processor.mappingURL(compiled.mappath));
        }
        else if (options.maps === false) {
            compiled.mappath = null;
            writeFile(compiled.filename, compiled.content);
        }
        else if (typeof (options.maps) === 'string') {
            const map = JSON.stringify(compiled.mapping, null, options.minified ? "" : "\t");
            const localname = `${path.basename(compiled.filename)}.map`;
            const url = path.join(options.maps, localname);
            compiled.mappath = path.join(path.dirname(compiled.filename), url);
            writeFile(compiled.filename, compiled.content += processor.mappingURL(url.replace(/\\/g, '/')));
            writeFile(compiled.mappath, map);
        }
        else {
            const map = JSON.stringify(compiled.mapping, null, options.minified ? "" : "\t");
            for (const [relative, absolute] of Object.entries(options.maps)) {
                const localname = path.join(options.localdir, path.relative(options.rootdir, compiled.filename));
                const url = path.join(relative, `${localname}.map`);
                compiled.mappath = path.join(absolute, `${localname}.map`);
                writeFile(compiled.filename, compiled.content += processor.mappingURL(url.replace(/\\/g, '/')));
                writeFile(compiled.mappath, map);
            }
        }
        return Promise.all(results).then(() => compiled);
    }
};
