import { assertEquals } from "https://deno.land/std@0.74.0/testing/asserts.ts";
import { fastify, FastifyValue, FastifyArray } from "../src/Fastify.ts";

Deno.test("FastifyValue.get() with no operations returns same data", async () => {
    const data = 1;
    const processed = await FastifyValue.init(data).get();
    assertEquals(processed, data);
});

Deno.test("FastifyArray.get() with no operations returns same data", async () => {
    const data = [1, 2, 3, 4, 5];
    const processed = await FastifyArray.init(data).get();
    assertEquals(data, processed);
});

Deno.test("FastifyArray.map().get() should return expected result", async () => {
    const data = [1, 2, 3, 4, 5];
    const addOne = (x: number) => x + 1;
    const fMap = await FastifyArray.init(data).map(addOne).get();
    const normalMap = data.map(addOne);

    assertEquals(fMap, normalMap);
});

Deno.test("FastifyArray.filter().get() should return expected result", async () => {
    const data = [1, 2, 3, 4, 5];
    const isEven = (x: number) => x % 2 == 0;
    const fFilter = await FastifyArray.init(data).filter(isEven).get();
    const normalFilter = data.filter(isEven);

    assertEquals(fFilter, normalFilter);
});

Deno.test("FastifyArray operations should execute in expected order", async () => {
    const data = [1, 2, 3, 4, 5];
    const stringify = (x: number) => x.toString();
    const shazam = (x: number | string) => {
        if (typeof x === "number") return x + 1;
        return x + "a";
    };

    const stringifyAndShazam = await FastifyArray.init(data)
        .map(stringify)
        .map(shazam)
        .get();
    assertEquals(stringifyAndShazam, ["1a", "2a", "3a", "4a", "5a"]);
});

Deno.test("fastify() with primitive should return FastifyValue", async () => {
    const instance = fastify(1);
    assertEquals(instance instanceof FastifyValue, true);
});

Deno.test("fastify() with array should return FastifyArray", async () => {
    const instance = fastify([1, 2, 3]);
    assertEquals(instance instanceof FastifyArray, true);
});
