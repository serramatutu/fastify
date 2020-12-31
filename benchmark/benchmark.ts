import {
    bench,
    runBenchmarks,
    BenchmarkRunResult,
} from "https://deno.land/std@0.83.0/testing/bench.ts";

import WorkerPoolExecutor from "../src/executor/WorkerPoolExecutor.ts";
import fastify from "../src/Fastify.ts";

import { cases } from "./cases.ts";

bench({
    name: `Executor spawn`,
    func: (b) => {
        b.start();

        const executor = new WorkerPoolExecutor();
        executor.start();
        executor.stop();

        b.stop();
    },
});

const executor = new WorkerPoolExecutor();

cases.map.forEach((benchCase) => {
    const benchName = `${benchCase[1].name}([${benchCase[0].length} elements])`;
    bench({
        name: `${benchName}: normal map`,
        func: (b) => {
            b.start();
            benchCase[0].map(benchCase[1]);
            b.stop();
        },
    });
    bench({
        name: `${benchName}: fastify map`,
        func: async (b) => {
            b.start();
            await fastify(benchCase[0]).map(benchCase[1]).get(executor);
            b.stop();
        },
    });
});

executor.start();
runBenchmarks()
    .then((results: BenchmarkRunResult) => {
        console.log(results);
        executor.stop();
    })
    .catch((error: Error) => {
        console.error("Error occurred!", error);
    });
