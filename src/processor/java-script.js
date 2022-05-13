module.exports = class {
    modes = [];

    constructor(mode) {
        this.modes = mode;
    }

    mappingURL(url) {
        return `\n//# sourceMappingURL=${url}`;
    }

    async process(value, options) {
        return value;
    }
};
