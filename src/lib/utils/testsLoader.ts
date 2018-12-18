import * as path from 'path';
import * as glob from 'glob';
import { Logger } from '../logger/logger';
import * as tsnode from 'ts-node';
import { TestSuite } from '../tests/testSuite';

export class TestsLoader {
    private static isTsnodeRegistered = false;
    constructor(private logger?: Logger) { }

    public async loadTests(root: string, patterns: string[], tsconfig: tsnode.Options): Promise<TestSuite> {
        this.registerTranspiler(tsconfig);

        const testSuites = new TestSuite();
        testSuites.name = 'Root';

        const files = await this.getTestFiles(root, patterns);
        for (const file of files) {
            const testInstances = await this.getTestInstancesFromFile(file));
            testInstances.forEach(x => testSuites.set(x.name, x));
        }

        return testSuites;
    }

    private async getTestInstancesFromFile(file: string): Promise<TestSuite[]> {
        const testSuiteInstances: TestSuite[] = [];
        const importedFile = await import(file);
        for (const key in importedFile) {
            const testSuiteInstance: TestSuite = importedFile[key].__testSuiteInstance;
            if (!testSuiteInstance)
                continue;

            testSuiteInstances.push(testSuiteInstance);
        }

        return testSuiteInstances;
    }

    private registerTranspiler(tsconfig: tsnode.Options) {
        if (TestsLoader.isTsnodeRegistered) return;

        tsnode.register(tsconfig);
        TestsLoader.isTsnodeRegistered = true;
    }

    private async getTestFiles(root: string, patterns: string[]): Promise<Set<string>> {
        const files: Set<string> = new Set();
        for (const pattern of patterns) {
            const matches = await this.matchFiles(root, pattern);
            for (const file of matches) {
                files.add(path.resolve(root, file));
            }
        }

        return files;
    }

    private async matchFiles(root: string, pattern: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            glob(pattern, { cwd: root, ignore: ['node_modules/**'] }, (err, files) => {
                if (err) reject(err);
                resolve(files);
            });
        });
    }
}