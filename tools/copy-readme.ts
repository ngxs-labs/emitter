import { join } from 'path';
import { existsSync, createReadStream, createWriteStream } from 'fs';

function copyReadmeAfterSuccessfulBuild(): void {
    const path = join(__dirname, '../README.md');
    const readmeExists = existsSync(path);

    if (!readmeExists) {
        return console.warn(`README.md doesn't exist on the root level!`);
    }

    createReadStream(path).pipe(createWriteStream(
        join(__dirname, '../dist/emitter/README.md')
    )).on('finish', () => {
        console.log(`Successfully copied README.md into dist/emitter folder!`)
    });
}

copyReadmeAfterSuccessfulBuild();
