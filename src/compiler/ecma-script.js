const {path, fs} = require("../util");
const babel = require("@babel/core");
const sourceMap = require("source-map-js");

module.exports = class {
    getOutputExtension() {
        return '.js';
    }

    async compile(input, options) {
        const presets = [[
            "@babel/env", {
                modules: false,
                targets: options.browserslist,
            }
        ]];
        const plugins = [];
        if (options.runtime.js) {
            plugins.push('@babel/plugin-external-helpers');
            if (options.nocache || !fs.existsSync(options.runtime.js)) {
                await fs.promises.putFile(options.runtime.js, babel.buildExternalHelpers(undefined, 'var') + await fs.promises.readFile(require.resolve('regenerator-runtime')));
            }
        }
        else {
            plugins.push({
                name: 'babel-prefix-plugin',
                visitor: {
                    Program: {
                        enter: function (path, file) {
                            path.unshiftContainer('body', babel.template(' "use transpile";')());
                        }
                    }
                }
            });
        }

        const [original, rewritten, depends] = await this.resolveRequire(input);

        // https://babeljs.io/docs/en/options
        const result = await babel.transformAsync(rewritten, {
            filename: input,
            ast: false,
            babelrc: false,
            presets: presets,
            plugins: plugins,
            inputSourceMap: false,
            sourceRoot: "",
            sourceMaps: true,
            comments: false,
            shouldPrintComment: (val) => /@preserve|license|copyright/i.test(val),
            compact: options.minified,
            retainLines: !options.minified,
            highlightCode: false,
        });

        const mapGenerator = new sourceMap.SourceMapGenerator(result.map);
        mapGenerator.setSourceContent(path.basename(input), original);
        for (const depend of depends) {
            mapGenerator.setSourceContent(depend.source, depend.content);
        }

        const mapConsumer = new sourceMap.SourceMapConsumer(result.map);
        mapConsumer.eachMapping(function (mapping) {
            let offset = 0;
            for (const depend of depends) {
                if (depend.lineNumber <= mapping.originalLine) {
                    if (mapping.originalLine < depend.lineNumber + depend.lineLength) {
                        mapping.originalLine -= depend.lineNumber - 1;
                        mapping.source = depend.source;
                        offset = 0;
                        break;
                    }
                    offset += depend.lineLength - 1;
                }
            }
            mapGenerator.addMapping({
                name: mapping.name,
                source: mapping.source,
                original: {
                    line: mapping.originalLine == null ? 1 : mapping.originalLine - offset, // why null ?
                    column: mapping.originalColumn,
                },
                generated: {
                    line: mapping.generatedLine,
                    column: mapping.generatedColumn,
                },
            });
        });

        return {
            depends: [input].concat(depends.map(d => d.filename)),
            content: result.code,
            mapping: mapGenerator.toJSON(),
        };
    }

    async resolveRequire(input) {
        const alllines = [];
        const depends = [];

        const main = async function (input, histories) {
            if (histories.includes(input)) {
                throw new Error(`detect recursive require ${input}:\n${histories.join("\n")}`);
            }
            histories = histories.concat([input]);

            const contents = (await fs.promises.readFile(input)).toString();
            const lines = contents.split(/\r\n|\n/g);
            const currentline = alllines.length;

            for (let i = 0; i < lines.length; i++) {
                const m = lines[i].match(/^\s*require\((.+?)\);?/);
                if (!m) {
                    alllines.push(lines[i]);
                    continue;
                }

                const source = eval(m[1]);
                const filename = path.isAbsolute(source) ? source : path.join(path.dirname(input), source);

                const [contents, number, length] = await main(filename, histories);

                depends.push({
                    filename: filename,
                    source: source,
                    content: contents,
                    lineNumber: number,
                    lineLength: length,
                });
            }

            return [contents, currentline + 1, lines.length];
        };
        const [contents] = await main(input, []);

        return [contents, alllines.join("\n"), depends];
    }
};
