const {path, fs} = require("../util");
const babel = require("@babel/core");

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
        // https://babeljs.io/docs/en/options
        const result = await babel.transformFileAsync(input, {
            ast: false,
            babelrc: false,
            presets: presets,
            plugins: plugins,
            inputSourceMap: false,
            sourceMaps: true,
            comments: false,
            compact: options.minified,
            retainLines: !options.minified,
            highlightCode: false,
        });
        return {
            depends: [input],
            content: result.code,
            mapping: result.map,
        };
    }
};
