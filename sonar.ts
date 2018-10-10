import { analyze, Issue } from 'sonarjs';
import { join } from 'path';

const path = join(__dirname, 'projects');

const enum Codes {
    Success = 0,
    Error = 1
}

(async () => {
    const issues: Issue[] = await analyze(path, {
        log(message: string) {
            console.log(`Log => message => ${message}`);
        }
    });

    if (!issues.length) {
        process.exit(Codes.Success);
    }

    issues.forEach((issue) => {
        console.log('Issue => ', issue);
    });

    process.exit(Codes.Error);
})();
