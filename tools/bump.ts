import { join } from 'path';
import { writeFileSync } from 'fs';
import { ReleaseType, inc } from 'semver';
import * as colors from 'colors/safe';

import { getLastTwoArguments } from './utils';

const releases = ['major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelase'];

function writePackage(path: string, packageJson: typeof import('../emitter/package.json')) {
  writeFileSync(path, `${JSON.stringify(packageJson, null, 2)}\n`);
}

function getPackage(path: string): typeof import('../emitter/package.json') {
  return require(path);
}

class InvalidBumpArguments extends Error {
  public message = colors.red(`
    You've specified invalid arguments, the command should look like
    "yarn bump --release {${releases.join('|')}}"
  `);
}

function bump() {
  const [argument, release] = getLastTwoArguments<string, ReleaseType>();

  if (argument !== '--release' || ~releases.indexOf(release) === 0) {
    throw new InvalidBumpArguments();
  }

  const path = join(__dirname, '../emitter/package.json');
  const packageJson = getPackage(path);
  packageJson.version = inc(packageJson.version, release)!;
  writePackage(path, packageJson);

  console.log(colors.green(`I've successfully changed version in the "package.json".`));
}

bump();
