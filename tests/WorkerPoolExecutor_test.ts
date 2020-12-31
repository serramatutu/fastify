import {
    assertEquals,
    assertThrows,
    assertThrowsAsync,
} from "https://deno.land/std@0.74.0/testing/asserts.ts";
import WorkerPoolExecutor from "../src/executor/WorkerPoolExecutor.ts";

Deno.test("WorkerPoolExecutor.stop() on stopped instance raises error", () => {
    const wp = new WorkerPoolExecutor();
    assertThrows(() => {
        wp.stop();
    });
});

Deno.test("WorkerPoolExecutor.start() on started instance raises error", () => {
    const wp = new WorkerPoolExecutor();
    wp.start();
    assertThrows(() => {
        wp.start();
    });
    wp.stop();
});

Deno.test("WorkerPoolExecutor.run() returns expected result", async () => {
    const wp = new WorkerPoolExecutor();
    wp.start();
    const result = await wp.run((a, b) => a + b, [1, 2]);
    assertEquals(result, 3);
    wp.stop();
});

Deno.test(
    "WorkerPoolExecutor.run() raises error when invoked with native function",
    async () => {
        const wp = new WorkerPoolExecutor();
        wp.start();
        assertThrowsAsync(async () => {
            await wp.run(Array.isArray, [{}]);
        });
        wp.stop();
    }
);
