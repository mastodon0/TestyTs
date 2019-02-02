import { TestCase } from '../testCase';
import { TestStatus } from '../testStatus';
import { TestInstance } from '../tests/test';
import { TestSuiteInstance } from '../tests/testSuite';

/**
 * Marks a method inside a @TestSuite decorated class as a test.
 *
 * @param name Name of the test, displayed in the test report.
 * @param testCases Allows to run the test multiple times with different arguments. Arguments will be passed to the test class.
 * @param timeout The test will automaticlaly fail if it has been running for longer than the specified timeout.
 */
export function Test(name?: string, testCases?: TestCase[], timeout: number = 2000) {
    return generateDecoratorFunction(name, TestStatus.Normal, testCases, timeout);
}

/**
 * Marks a method inside a @TestSuite decorated class as a focused test.
 * If one or more tests are marked as focused, only those will be ran.
 *
 * @param name Name of the test, displayed in the test report.
 * @param testCases Allows to run the test multiple times with different arguments. Arguments will be passed to the test class.
 * @param timeout The test will automaticlaly fail if it has been running for longer than the specified timeout.
 */
export function FTest(name?: string, testCases?: TestCase[], timeout: number = 2000) {
    return generateDecoratorFunction(name, TestStatus.Focused, testCases, timeout);
}

/** 
 * Marks a method inside a @TestSuite decorated class as an ignored test.
 * Ignored tests will not be ran, but they will still appear in test reports.
 * 
 * @param name Name of the test, displayed in the test report.
 * @param testCases Allows to run the test multiple times with different arguments. Arguments will be passed to the test class.
 * @param timeout The test will automaticlaly fail if it has been running for longer than the specified timeout.
 */
export function XTest(name?: string, testCases?: TestCase[], timeout: number = 2000) {
    return generateDecoratorFunction(name, TestStatus.Ignored, testCases, timeout);
}

/**
 * @deprecated since 0.7.0. Prefer using the capitalized version.
 * Marks a method inside a @TestSuite decorated class as a test.
 *
 * @param name Name of the test, displayed in the test report.
 * @param testCases Allows to run the test multiple times with different arguments. Arguments will be passed to the test class.
 * @param timeout The test will automaticlaly fail if it has been running for longer than the specified timeout.
 */
export function test(name?: string, testCases?: TestCase[], timeout: number = 2000) {
    return Test(name, testCases, timeout);
}

/**
 * @deprecated since 0.7.0. Prefer using the capitalized version.
 * Marks a method inside a @TestSuite decorated class as a focused test.
 * If one or more tests are marked as focused, only those will be ran.
 *
 * @param name Name of the test, displayed in the test report.
 * @param testCases Allows to run the test multiple times with different arguments. Arguments will be passed to the test class.
 * @param timeout The test will automaticlaly fail if it has been running for longer than the specified timeout.
 */
export function ftest(name?: string, testCases?: TestCase[], timeout: number = 2000) {
    return FTest(name, testCases, timeout);
}

/** 
 * @deprecated since 0.7.0. Prefer using the capitalized version.
 * Marks a method inside a @TestSuite decorated class as an ignored test.
 * Ignored tests will not be ran, but they will still appear in test reports.
 * 
 * @param name Name of the test, displayed in the test report.
 * @param testCases Allows to run the test multiple times with different arguments. Arguments will be passed to the test class.
 * @param timeout The test will automaticlaly fail if it has been running for longer than the specified timeout.
 */
export function xtest(name?: string, testCases?: TestCase[], timeout: number = 2000) {
    return XTest(name, testCases, timeout);
}

function initializeTarget(target: any) {
    if (!target.__testSuiteInstance) {
        target.__testSuiteInstance = new TestSuiteInstance();
    }
    else {
        target.__testSuiteInstance = (target.__testSuiteInstance as TestSuiteInstance).clone();
    }
}

function generateDecoratorFunction(name: string, status: TestStatus, testCases: TestCase[], timeout: number) {
    return (target, key, descriptor) => {
        initializeTarget(target);
        const testSuiteInstance: TestSuiteInstance = target.__testSuiteInstance;

        name = name ? name : key;
        if (testSuiteInstance.has(name)) {
            throw new Error(`A test named "${name}" is already registered. Copy pasta much?`);
        }

        testSuiteInstance.set(name, generateTest(name, testCases, status, descriptor.value, timeout));
    };
}

function generateTest(name: string, testCases: TestCase[], status: TestStatus, testMethod: Function, timeout: number): TestInstance | TestSuiteInstance {
    return testCases
        ? generateTestsFromTestcases(name, testMethod, testCases, status, timeout)
        : new TestInstance(name, decorateTest(testMethod, timeout), status);
}

function generateTestsFromTestcases(name: string, testMethod: Function, testCases: TestCase[], status: TestStatus, timeout: number): TestSuiteInstance {
    const tests = new TestSuiteInstance();
    tests.name = name;
    for (const testCase of testCases) {
        const decoratedTestMethod = decorateTest(testMethod, timeout, testCase.args);
        tests.set(testCase.name, new TestInstance(testCase.name, decoratedTestMethod, status));
    }

    return tests;
}

function decorateTest(testMethod: Function, timeout: number, args: any[] = []) {
    return async (context: any) => {
        await new Promise(async (resolve, reject) => {
            setTimeout(() => reject('Test has timed out.'), timeout);
            try {
                await testMethod.bind(context)(...args);
            }
            catch (err) {
                reject(err);
            }

            resolve();
        });
    };
}