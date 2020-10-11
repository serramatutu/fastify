import {
    assertEquals,
    assertThrows,
    assertThrowsAsync,
} from "https://deno.land/std@0.74.0/testing/asserts.ts";
import WorkerPool from "../src/WorkerPool.ts";

Deno.test("WorkerPool.stop() on stopped instance raises error", () => {
    const wp = new WorkerPool();
    assertThrows(() => {
        wp.stop();
    });
});

Deno.test("WorkerPool.start() on started instance raises error", () => {
    const wp = new WorkerPool();
    wp.start();
    assertThrows(() => {
        wp.start();
    });
    wp.stop();
});

Deno.test("WorkerPool.run() returns expected result", async () => {
    const wp = new WorkerPool();
    wp.start();
    const result = await wp.run((a, b) => a + b, [1, 2]);
    assertEquals(result, 3);
    wp.stop();
});

Deno.test(
    "WorkerPool.run() raises error when invoked with native function",
    async () => {
        const wp = new WorkerPool();
        wp.start();
        assertThrowsAsync(async () => {
            await wp.run(Array.isArray, [{}]);
        });
        wp.stop();
    }
);
