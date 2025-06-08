const url = require("url");
const {path, fs} = require("../util");
const crypto = require("crypto");
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('@tailwindcss/postcss');

module.exports = class {
    modes = {};

    constructor(mode) {
        this.modes = mode;
    }

    mappingURL(url) {
        return `\n/*# sourceMappingURL=${url} */`;
    }

    async process(value, options) {
        const postfuncs = [];

        if (this.modes.urlhash) {
            const supportedProps = this.modes.urlhash.supportedProps;
            postfuncs.push(function (css) {
                css.walkDecls(function (decl) {
                    if (supportedProps.includes(decl.prop)) {
                        decl.value = decl.value.replace(/url\s*\(\s*(['"])?([^'")]+)(['"])?\s*\)/gi, function (match, s, uri, e) {
                            const parts = url.parse(uri);
                            const fullpath = path.isAbsolute(parts.pathname)
                                ? path.join(options.rootdir, parts.pathname.substring(options.localdir.length))
                                : path.join(path.dirname(value.filename), parts.pathname)
                            ;
                            if (fs.existsSync(fullpath)) {
                                const sha1 = crypto.createHash('sha1');
                                sha1.update(fs.readFileSync(fullpath));
                                const id = sha1.digest('hex');
                                const query = parts.query ? '&' + parts.query : '';
                                const hash = parts.hash ? parts.hash : '';
                                return `url(${s || ''}${parts.pathname}?${id}${query}${hash}${e || ''})`;
                            }
                            return match;
                        });
                    }
                });
            });
        }
        if (this.modes.autoprefixer) {
            postfuncs.push(autoprefixer(Object.assign({
                overrideBrowserslist: options.browserslist,
            }, this.modes.autoprefixer)));
        }
        if (this.modes.tailwind) {
            postfuncs.push(tailwindcss(this.modes.tailwind));
        }

        if (postfuncs.length === 0) {
            return value;
        }

        const posted = await postcss(postfuncs).process(value.content, {
            from: value.filename,
            map: {
                inline: false,
                sourcesContent: true,
                annotation: false,
                prev: value.mapping,
            },
        });
        value.content = posted.css;
        value.mapping = posted.map.toJSON();

        return value;
    }
};
