module.exports = {
    daemons: ['run', 'httpd', 'fsd'],
    routes: {
        "/virtual-script": __dirname + '/../example/script',
        "/virtual-style": __dirname + '/../example/style',
        "/": __dirname + '/../example',
        "/script/ab.js": [
            __dirname + '/script/a.es',
            __dirname + '/script/b.es',
        ],
        "/style/ab.css": [
            __dirname + '/style/a.scss',
            __dirname + '/style/b.scss',
        ],
    },
    maps: {
        "/map": __dirname + '/../example/map',
    },
    runtime: {
        "js": __dirname + '/script/runtime.js',
    },
};
