const url = require("url");
const {path, fs} = require("../util");
const crypto = require("crypto");
const sourcemapmerge = require("merge-source-map");
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');

module.exports = class {
    modes = [];

    constructor(mode) {
        this.modes = mode;
    }

    mappingURL(url) {
        return `\n/*# sourceMappingURL=${url} */`;
    }

    async process(value, options) {
        if (!this.modes.length) {
            return value;
        }

        const postfuncs = [];
        if (this.modes.includes('urlhash')) {
            postfuncs.push(function (css) {
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
        if (this.modes.includes('autoprefixer')) {
            postfuncs.push(autoprefixer({
                grid: "autoplace",
                overrideBrowserslist: options.browserslist,
            }));
        }
        const posted = await postcss(postfuncs).process(value.content, {
            from: value.filename,
            map: {
                inline: false,
                sourcesContent: true,
                annotation: false,
            },
        });
        value.content = posted.css;
        value.mapping = sourcemapmerge(value.mapping, posted.map.toString());

        return value;
    }
};
