const sass = require('sass');

module.exports = class {
    getOutputExtension() {
        return '.css';
    }

    async compile(input, options) {
        // https://sass-lang.com/documentation/js-api
        const result = await sass.compileAsync(input, {
            style: options.minified ? 'compressed' : 'expanded',
            sourceMap: true,
            sourceMapIncludeSources: true,
        });
        return {
            depends: result.loadedUrls
                .filter(v => v.protocol === 'file:')
                .map(url => process.platform === 'win32' ? url.pathname.substring(1) : url.pathname),
            content: result.css + "\n",
            mapping: result.sourceMap,
        };
    }
};
