import { assertEquals } from "https://deno.land/std@0.74.0/testing/asserts.ts";
import {
    Executor,
    WorkerPoolExecutor,
    MainThreadExecutor,
} from "../src/executor/mod.ts";

type ExecutorConstructor = new () => Executor;

function testExecutorClass(executorConstructor: ExecutorConstructor): void {
    Deno.test(
        `${executorConstructor.name}.run() returns expected result`,
        async () => {
            const wp = new executorConstructor();
            wp.start();
            const result = await wp.run((a, b) => a + b, [1, 2]);
            assertEquals(result, 3);
            wp.stop();
        }
    );
}

const executorClasses: ExecutorConstructor[] = [
    MainThreadExecutor,
    WorkerPoolExecutor,
];

for (const executorClass of executorClasses) {
    testExecutorClass(executorClass);
}
