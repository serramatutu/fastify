import { assertEquals } from "https://deno.land/std@0.74.0/testing/asserts.ts";
import Fastify from "../src/Fastify.ts";

Deno.test("Fastify.run() with no operations returns same data", () => {
    const data = [1, 2, 3, 4, 5];
    const processed = new Fastify(data).run();
    assertEquals(data, processed);
});

Deno.test("Fastify.map().run() should return expected result", () => {
    const data = [1, 2, 3, 4, 5];
    const addOne = (x: number) => x + 1;
    const fMap = new Fastify(data).map(addOne).run();
    const normalMap = data.map(addOne);

    assertEquals(fMap, normalMap);
});

Deno.test("Fastify.filter().run() should return expected result", () => {
    const data = [1, 2, 3, 4, 5];
    const isEven = (x: number) => x % 2 == 0;
    const fFilter = new Fastify(data).filter(isEven).run();
    const normalFilter = data.filter(isEven);

    assertEquals(fFilter, normalFilter);
});

Deno.test("Fastify operations should execute in expected order", () => {
    const data = [1, 2, 3, 4, 5];
    const stringify = (x: number) => x.toString();
    const shazam = (x: number | string) => {
        if (typeof x === "number") return x + 1;
        return x + "a";
    };

    const stringifyAndShazam = new Fastify(data).map(stringify).map(shazam).run();
    assertEquals(stringifyAndShazam, ["1a", "2a", "3a", "4a", "5a"]);
});
