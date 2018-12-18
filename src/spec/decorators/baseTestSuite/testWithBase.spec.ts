import { testSuite, test, expect } from '../../../testyCore';
import { TestSuiteTestsBase } from '../testSuiteTestsBase';
import { TestSuiteWithBase, BaseTestSuite } from './testSuiteWithBase';

@testSuite('Test Suite With Base Test Suite Tests')
export class BeforeAfterDecoratorsTestSuite extends TestSuiteTestsBase {

    @test('the base and the actual test suite before and after methods are called.')
    private async trivialCase() {
        // Arrange
        const testSuite = this.getTestSuiteInstance(TestSuiteWithBase);

        // Act
        await testSuite.accept(this.visitor);

        // Assert
        expect.toBeEqual(testSuite.context.beforeAllExecuted[0], BaseTestSuite);
        expect.toBeEqual(testSuite.context.beforeAllExecuted[1], TestSuiteWithBase);
        expect.toBeEqual(testSuite.context.beforeEachExecuted[0], BaseTestSuite);
        expect.toBeEqual(testSuite.context.beforeEachExecuted[1], TestSuiteWithBase);
        expect.toBeEqual(testSuite.context.afterEachExecuted[0], BaseTestSuite);
        expect.toBeEqual(testSuite.context.afterEachExecuted[1], TestSuiteWithBase);
        expect.toBeEqual(testSuite.context.afterAllExecuted[0], BaseTestSuite);
        expect.toBeEqual(testSuite.context.afterAllExecuted[1], TestSuiteWithBase);
    }
}

