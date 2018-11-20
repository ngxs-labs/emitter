import * as fs from 'fs';
import { argv } from 'yargs';
import { join } from 'path';
import { promisify } from 'util';
import { ReleaseType, inc } from 'semver';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

function getPackage(path: string) {
    return readFile(path, {
        encoding: 'utf-8'
    }).then(JSON.parse);
}

function writePackage(path: string, json: any) {
    return writeFile(path, `${JSON.stringify(json, null, 4)}\n`);
}

async function bump(): Promise<void> {
    const release: ReleaseType = argv.release;

    if (!release) {
        return console.warn('Specify `--release` argument!');
    }

    const path = join(__dirname, '../src/package.json');
    const json = await getPackage(path);
    json.version = inc(json.version, release);
    await writePackage(path, json);
}

bump();
