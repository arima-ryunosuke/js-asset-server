const config = {
    routes: {
        "/virtual": __dirname + '/../',
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
};

const assetter = require('../index');
assetter.httpd(config);
assetter.fsd(config);
