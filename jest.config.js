const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig');

const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' });

module.exports = {
  moduleNameMapper,
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      allowSyntheticDefaultImports: true
    }
  },
  cacheDirectory: '<rootDir>/.cache'
};
