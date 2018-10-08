import * as gulp from 'gulp';
import * as semver from 'semver';
import * as fs from 'fs';
import * as childProcess from 'child_process';
import chalk from 'chalk';
import { promisify } from 'util';
import { resolve } from 'path';
import { argv } from 'yargs';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const exec = promisify(childProcess.exec);
const path = resolve(process.cwd(), 'projects/emitter/package.json');

const enum Codes {
    SUCCESS = 0,
    ERROR = 1
}

const branch: string = argv.branch;
const commit: string = argv.commit;
const match = commit.match(/major|minor|patch/);

if (!branch || !commit) {
    console.log(chalk.bgRedBright(
        'You should specify branch name and commit log message using `--branch` and `--commit` arguments'
    ));

    process.exit(Codes.ERROR);
}

gulp.task('bump', async () => {
    if (!match) {
        return;
    }

    const content = await readFile(path, {
        encoding: 'utf8'
    });

    const config = JSON.parse(content);
    const { version } = config;
    const release = match[0] as semver.ReleaseType;

    await writeFile(path, JSON.stringify({
        ...config,
        version: semver.inc(version, release)
    }, null, 4));
});

gulp.task('checkout', async () => {
    await exec(`git checkout -b ${branch}`);
});

gulp.task('commit', async () => {
    await exec('git add .');
    await exec(`git commit -m '${commit}'`);
});

gulp.task('push', async () => {
    await exec(`git push origin ${branch}`);
});

gulp.task('build', async () => {
    if (!match) {
        return;
    }

    await exec('yarn build emitter --prod=true');
});

gulp.task('publish', async () => {
    if (!match) {
        return;
    }

    await exec('npm publish dist/emitter --access=public')
});

gulp.task('default', gulp.series('bump', 'checkout', 'commit', 'push', 'build', 'publish'));
