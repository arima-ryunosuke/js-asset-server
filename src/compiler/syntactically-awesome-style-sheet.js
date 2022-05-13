const sass = require('sass');

module.exports = class {
    getOutputExtension() {
        return '.css';
    }

    async compile(input, options) {
        // https://sass-lang.com/documentation/js-api
        const result = sass.renderSync({
            outputStyle: options.minified ? 'compressed' : 'expanded',
            file: input,
            sourceMap: 'dummy',
            omitSourceMapUrl: true,
            sourceMapContents: true,
        });
        return {
            depends: result.stats.includedFiles,
            content: result.css.toString() + "\n",
            mapping: JSON.parse(result.map.toString()),
        };
    }
};
