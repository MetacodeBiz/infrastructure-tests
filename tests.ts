require('source-map-support').install();

import fs = require('fs');
import { sync } from 'glob';
import * as stackTrace from 'stack-trace';
import { execSync } from 'child_process';

(global as any).fetch = require('node-fetch');

export function testModule(fileName: string) {
    const exports = require('./' + fileName);
    var results: [string, Promise<Error>][] = [];
    for (const ref in exports) {
        results.push([ref, Promise.resolve().then(() => exports[ref]()).catch(e => e)]);
    }

    results.sort((first, second) => {
        if (first[0] > second[0]) return 1;
        if (first[0] < second[0]) return -1;
        return 0;
    });

    return Promise.all(results.map(result => result[1])).then(values => {
        let printDetails = true, hasErrors = false;
        console.log(fileName + ':');
        for (let i = 0; i < values.length; i++) {
            let name = results[i][0], value = values[i];
            if (!value) {
                console.log(' \x1b[32;1m✓\x1b[0m ' + name)
            } else {
                hasErrors = true;
                let e = value as any as Error;
                console.error(' \x1b[31;1m✗\x1b[0m ' + name + ' failed: ' + (e.message || e));
                if (!printDetails) {
                    continue;
                }
                printDetails = false;
                if ('expected' in e && 'actual' in e) {
                    console.error('                      expected: ' + (<any>e).expected);
                    console.error('                      actual: ' + (<any>e).actual);
                }
                const frame = stackTrace.parse(e)[0];
                const file = frame.getFileName().split(/[\/|\\]/g).pop();
                const line = frame.getLineNumber();
                const revision = execSync('git rev-parse HEAD').toString('utf-8').trim();
                console.error(`Source: https://github.com/wiktor-k/infrastructure-tests/blob/${revision}/${file}#L${line}`);
                console.error(e.stack);
                console.error('')
            }
        }
        return hasErrors;
    });
}

Promise.all(sync(process.argv[2]).map(fileName => testModule(fileName)))
    .then((hasErrors: any) => process.exit(hasErrors.some((hasErrors: boolean) => hasErrors) ? 1 : 0));
