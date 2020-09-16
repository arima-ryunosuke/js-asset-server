const config = {
    routes: {
        "/virtual": __dirname + '/../',
        "/": __dirname + '/../example',
    },
    maps: {
        "/map": __dirname + '/../example/map',
    },
};

const daemon = require('../index');
daemon.httpd(config);
daemon.fsd(config);
