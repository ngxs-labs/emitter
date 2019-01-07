const { join } = require('path');

module.exports = {
    moduleNameMapper: {
        '@ngxs-labs/emitter': join(__dirname, 'src')
    }
};
