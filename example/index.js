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
assetter.transpiler.regsiter('.stylus', {
    ext: '.css',
    mappingURL: url => `\n/*# sourceMappingURL=${url} */`.replace(/\\/g, '/'),
    compile: async function (input, options) {
        const fs = require('fs');
        return new Promise(async (resolve, reject) => {
            resolve({
                content: (await fs.promises.readFile(input)).toString().toUpperCase(),
                mapping: {},
            });
        });
    },
});
assetter.httpd(config);
assetter.fsd(config);
