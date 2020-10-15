const {fs, path} = require('./util');
const util = require('util');
const url = require('url');
const minimatch = require('minimatch');

const compilers = new function () {
    this['.sass'] = this['.scss'] = {
        ext: '.css',
        precompile: async function (input) {
            const depends = [input];
            const nodeSass = require('node-sass');
            this.promise = this.promise || util.promisify(nodeSass.render);
            return this.promise({
                file: input,
                // https://qiita.com/http_kato83/items/c62ee3d255f45fc30c3b
                data: (await fs.promises.readFile(input)).toString(),
                sourceMap: 'dummy',
                omitSourceMapUrl: true,
                importer: function (url, prev, done) {
                    if (!require('url').parse(url).protocol) {
                        if (!path.isAbsolute(url)) {
                            url = path.join(path.dirname(prev), url);
                        }
                        const parts = path.parse(url);
                        const files = [
                            `_${parts.name}.${parts.ext}`,
                            `_${parts.name}.scss`, `_${parts.name}.sass`,
                            `${parts.name}.scss`, `${parts.name}.sass`,
                        ];
                        const basename = files.find(e => fs.existsSync(path.join(parts.dir, e)));
                        if (basename) {
                            url = path.join(parts.dir, basename);
                        }
                    }

                    depends.push(url);
                    return done();
                },
            }).then(result => ({
                depends: depends,
            }));
        },
        compile: async function (input, options) {
            // https://github.com/sass/node-sass
            const nodeSass = require('node-sass');
            this.promise = this.promise || util.promisify(nodeSass.render);
            return this.promise({
                outputStyle: options.minified ? 'compressed' : 'expanded',
                file: input,
                // https://qiita.com/http_kato83/items/c62ee3d255f45fc30c3b
                data: (await fs.promises.readFile(input)).toString(),
                sourceMap: 'dummy',
                omitSourceMapUrl: true,
                sourceMapContents: true,
            }).then(result => ({
                content: result.css.toString(),
                mapping: JSON.parse(result.map.toString()),
            }));
        },
        postcompile: async function (output, options) {
            return output;
        },
    };

    this['.styl'] = this['.stylus'] = {
        ext: '.css',
        precompile: async function (input) {
            return Promise.resolve({
                depends: [input],
            });
        },
        compile: async function (input, options) {
            // https://stylus-lang.com/docs/executable.html
            const content = (await fs.promises.readFile(input)).toString();
            const renderer = require('stylus')(content, {
                filename: input,
                compress: options.minified,
                sourcemap: {comment: false},
            });
            return Promise.resolve({
                content: renderer.render(),
                mapping: Object.assign(renderer.sourcemap, {
                    sourcesContent: [content],
                }),
            })
        },
        postcompile: async function (output, options) {
            return output;
        },
    };

    this['.es'] = this['.es6'] = {
        ext: '.js',
        precompile: async function (input) {
            return Promise.resolve({
                depends: [input],
            });
        },
        compile: async function (input, options) {
            // https://babeljs.io/docs/en/options
            const babel = require('@babel/core');
            return babel.transformFileAsync(input, {
                ast: false,
                babelrc: false,
                presets: [["@babel/env", {
                    modules: false,
                    targets: options.browserslist,
                }]],
                plugins: [
                    {
                        name: 'babel-prefix-plugin',
                        visitor: {
                            Program: {
                                enter: function (path, file) {
                                    path.unshiftContainer('body', babel.template(' "use transpile";')());
                                }
                            }
                        }
                    }
                ],
                inputSourceMap: false,
                sourceMaps: true,
                comments: false,
                compact: options.minified,
                retainLines: !options.minified,
                highlightCode: false,
            }).then(result => ({
                content: result.code,
                mapping: result.map,
            }));
        },
        postcompile: async function (output, options) {
            return output;
        },
    };

    this['.css'] = Object.assign({
        mappingURL: url => `\n/*# sourceMappingURL=${url} */`,
        complete: async function (value, options) {
            value.content = require('postcss')([
                function (css) {
                    const supportedProps = [
                        'background',
                        'background-image',
                        'border-image',
                        'behavior',
                        'list-style',
                        'src',
                        'cursor',
                    ];
                    css.walkDecls(function (decl) {
                        if (supportedProps.includes(decl.prop)) {
                            decl.value = decl.value.replace(/url\s*\(\s*(['"])?([^'")]+)(['"])?\s*\)/gi, function (match, s, uri, e) {
                                const parts = url.parse(uri);
                                const fullpath = path.isAbsolute(parts.pathname)
                                    ? path.join(options.rootdir, parts.pathname.substring(options.localdir.length))
                                    : path.join(path.dirname(value.filename), parts.pathname)
                                ;
                                if (fs.existsSync(fullpath)) {
                                    const time = fs.statSync(fullpath).mtime.getTime();
                                    const query = parts.query ? '&' + parts.query : '';
                                    const hash = parts.hash ? parts.hash : '';
                                    return `url(${s || ''}${parts.pathname}?${time}${query}${hash}${e || ''})`;
                                }
                                return match;
                            });
                        }
                    });
                },
                require('autoprefixer')({
                    grid: "autoplace",
                    overrideBrowserslist: options.browserslist,
                }),
            ]).process(value.content, {}).css;
        },
    }, this['.sass']);

    this['.js'] = Object.assign({
        mappingURL: url => `\n//# sourceMappingURL=${url}`,
        complete: async function (value, options) {},
    }, this['.es']);
};

module.exports.regsiter = function (altext, compiler, similar = null) {
    if (typeof (compiler) === 'string') {
        similar = compiler;
        compiler = {};
    }
    compilers[altext] = Object.assign({}, compilers[similar || altext] || {}, compiler);
};

module.exports.getAltfile = function (filename, forced = false) {
    const parts = path.parse(filename);
    const basename = path.join(parts.dir, path.basename(parts.name, '.min'));
    const minified = forced || parts.name.endsWith('.min');

    const alts = Object.entries(compilers)
        .filter(entry => parts.ext === entry[1].ext)
        .sort((a, b) => a[1].ext === b[0] ? -1 : 1)
        .map(entry => entry[0])
        .filter(ext => minified || ext !== parts.ext)
    ;

    const alt = alts.find(alt => fs.existsSync(basename + alt));
    return alt ? basename + alt : null;
};

module.exports.canTranspile = function (filename) {
    const parts = path.parse(filename);

    const alts = Object.entries(compilers)
        .filter(entry => entry[0] !== entry[1].ext)
        .map(entry => entry[0])
    ;
    return alts.includes(parts.ext);
};

const metadata = {};
const transpile = async function (altfile, options) {
    altfile = path.resolve(altfile);

    for (const pattern of options.patterns) {
        if (!minimatch(altfile, pattern)) {
            options.logger.info(`skip ${altfile} (no match)`);
            return;
        }
    }

    const parts = path.parse(altfile);
    const compiler = compilers[parts.ext] || {};
    const outfile = path.resolve(options.outfile || path.changeExt(altfile, (options.minified ? '.min' : '') + compiler.ext));
    const cachefile = path.join(options.tmpdir, 'assetter', 'transpiled', altfile.replace(':', ';') + '.min-' + options.minified + '.json');

    // for skip
    if (!Object.keys(compiler).length) {
        options.logger.info(`skip ${altfile} (not supported)`);
        return;
    }
    if (options.minified && parts.name.endsWith('.min')) {
        options.logger.info(`skip ${altfile} (already minified)`);
        return;
    }
    if (outfile === altfile) {
        options.logger.info(`skip ${altfile} (same file)`);
        return;
    }

    if (options.nocache) {
        delete metadata[altfile];
    }
    metadata[altfile] = metadata[altfile] || await compiler.precompile(altfile);
    const altmtime = Math.max(...await Promise.all(metadata[altfile].depends.map(v => fs.promises.mtime(v))));

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
    return compiler.compile(altfile, options).then(async function (value) {
        value.filename = outfile;
        value.mapping.file = path.join(options.localdir, path.relative(options.rootdir, outfile)).replace(/\\/g, '/');
        const relative = path.relative(options.rootdir, altfile);
        if (relative.startsWith('..')) {
            value.mapping.sources = [path.basename(altfile)];
        }

        await compiler.postcompile(value, options);
        await fs.promises.putFile(cachefile, JSON.stringify(value));
        options.logger.info(`done ${altfile} (${Date.now() - starttime}ms)`);
        return value;
    }, function (error) {
        options.logger.info(`fail ${altfile} (${Date.now() - starttime}ms)`);
        throw error;
    });
};

module.exports.transpile = async function (altfile, options = {}) {
    options = Object.assign({}, {
        maps: "",        // "": same location, string: specify relative, true: data URI, false: no map file, object: see code
        outfile: null,   // output filename (null: same direcotry)
        minified: false, // true: minify, false: human readable, null: auto detect by outfile
        nocache: false,  // true: nouse cache file
        nowrite: false,  // true: nowriting file
        logger: console, // logger instance
    }, options);

    if (options.minified === null) {
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
    const result = Promise.all(altfile.map(file => transpile(file, options))).then(function (values) {
        values = values.filter(v => v);
        if (values.length) {
            // https://qiita.com/kozy4324/items/1a0f5c1269eafdebd3f8
            return {
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
        }
    });

    return result.then(async result => {
        if (!result) {
            return;
        }

        const results = [];
        const compiler = compilers[path.extname(result.filename)];
        const writeFile = function (filename, content) {
            if (!options.nowrite) {
                results.push(fs.promises.putFile(filename, content).then(function () {
                    options.logger.info(`write ${filename}`);
                }));
            }
        };

        await compiler.complete(result, options);

        if (options.maps === true) {
            const map = Buffer.from(JSON.stringify(result.mapping)).toString('base64');
            result.mappath = `data:application/json;charset=utf-8;base64,` + map;
            writeFile(result.filename, result.content += compiler.mappingURL(result.mappath));
        }
        else if (options.maps === false) {
            result.mappath = null;
            writeFile(result.filename, result.content);
        }
        else if (typeof (options.maps) === 'string') {
            const map = JSON.stringify(result.mapping, null, options.minified ? "" : "\t");
            const localname = `${path.basename(result.filename)}.map`;
            const url = path.join(options.maps, localname);
            result.mappath = path.join(path.dirname(result.filename), url);
            writeFile(result.filename, result.content += compiler.mappingURL(url.replace(/\\/g, '/')));
            writeFile(result.mappath, map);
        }
        else {
            const map = JSON.stringify(result.mapping, null, options.minified ? "" : "\t");
            for (const [relative, absolute] of Object.entries(options.maps)) {
                const localname = path.join(options.localdir, path.relative(options.rootdir, result.filename));
                const url = path.join(relative, `${localname}.map`);
                result.mappath = path.join(absolute, `${localname}.map`);
                writeFile(result.filename, result.content += compiler.mappingURL(url.replace(/\\/g, '/')));
                writeFile(result.mappath, map);
            }
        }
        return Promise.all(results).then(() => result);
    });
};
