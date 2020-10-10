import { assertThrows } from "https://deno.land/std@0.74.0/testing/asserts.ts";
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
