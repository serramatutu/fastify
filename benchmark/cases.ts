import { MapFunction, FilterFunction } from "../src/Fastify.ts";

let generators = {
    ascending: function* (start: number, stop: number, step: number = 1) {
        for (let i = start; i < stop; i += step) {
            yield i;
        }
    },
};

let mappers = {
    add: function (x: string | number) {
        return (x as number) + 1;
    },
    stringify: function (x: string | number) {
        return x.toString();
    },
    toBoolean: function (x: string | number) {
        return !!x;
    },
};

let filters = {
    odd: function (x: number) {
        return x % 2 != 0;
    },
    even: function (x: number) {
        return x % 2 == 0;
    },
};

export type BenchmarkMapCase<T, R> = [T[], MapFunction<T, R>];
export type BenchmarkFilterCase<T> = [T[], FilterFunction<T>];

export type Cases = {
    map: BenchmarkMapCase<any, any>[];
    filter: BenchmarkFilterCase<any>[];
};

const cases: Cases = {
    map: [
        [Array.from(generators.ascending(0, 10)), mappers.add],
        [Array.from(generators.ascending(0, 10)), mappers.stringify],
        [Array.from(generators.ascending(0, 10)), mappers.toBoolean],

        [Array.from(generators.ascending(0, 1000)), mappers.add],
        [Array.from(generators.ascending(0, 1000)), mappers.stringify],
        [Array.from(generators.ascending(0, 1000)), mappers.toBoolean],

        [Array.from(generators.ascending(0, 10000)), mappers.add],
        [Array.from(generators.ascending(0, 10000)), mappers.stringify],
        [Array.from(generators.ascending(0, 10000)), mappers.toBoolean],

        [Array.from(generators.ascending(0, 100000)), mappers.add],
        [Array.from(generators.ascending(0, 100000)), mappers.stringify],
        [Array.from(generators.ascending(0, 100000)), mappers.toBoolean],
    ],
    filter: [
        [Array.from(generators.ascending(0, 10)), filters.odd],
        [Array.from(generators.ascending(0, 10)), filters.even],
    ],
};

export { cases };
