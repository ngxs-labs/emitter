import { analyze, Issue } from 'sonarjs';
import { join } from 'path';

const path = join(__dirname, '..', 'src');

const enum Codes {
    Success = 0,
    Error = 1
}

async function run(): Promise<Codes> {
    const issues: Issue[] = await analyze(path, {
        log(message: string) {
            console.log(`Log => message => ${message}`);
        }
    });

    if (!issues.length) {
        console.log('No issues found!');
        return Codes.Success;
    }

    issues.forEach((issue) => {
        console.log('Issue => ', issue);
    });

    return Codes.Error;
}

(async () => {
    process.exit(await run());
})();
