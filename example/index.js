const config = {
    routes: {
        "/virtual": __dirname + '/../',
        "/": __dirname + '/../example',
    },
    maps: {
        "/map": __dirname + '/../example/map',
    },
};

const assetter = require('../index');
assetter.httpd(config);
assetter.fsd(config);
