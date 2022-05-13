const {fs} = require("../util");
const stylus = require('stylus');

module.exports = class {
    getOutputExtension() {
        return '.css';
    }

    async compile(input, options) {
        const content = (await fs.promises.readFile(input)).toString();
        // https://stylus-lang.com/docs/executable.html
        const renderer = stylus(content, {
            filename: input,
            compress: options.minified,
            sourcemap: {comment: false},
        });
        return {
            depends: [input],
            content: renderer.render(),
            mapping: Object.assign(renderer.sourcemap, {
                sourcesContent: [content],
            }),
        };
    }
};
