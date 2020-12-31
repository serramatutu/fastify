import Executor from "./Executor.ts";
import WorkerPool from "./WorkerPool.ts";

export type AbstractExecutorFactory = () => Executor;

export function defaultExecutorFactory(): Executor {
    // TODO: create default, non-worker-based executor when
    // number of CPUs is available in Deno. See: https://github.com/denoland/deno/issues/3802
    return new WorkerPool();
}

export * from "./Executor.ts";
export * from "./WorkerPool.ts";
