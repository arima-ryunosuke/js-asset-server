const {fs} = require('../../src/util');

module.exports = class {
    getOutputExtension() {
        return '.css';
    }

    async compile(input, options) {
        // postcss is syntactically just css, so go through it
        return {
            depends: [input],
            content: (await fs.promises.readFile(input)).toString(),
            mapping: {
                version: 3,
                sources: [input],
                mappings: '',
                names: [],
            },
        };
    }
};
