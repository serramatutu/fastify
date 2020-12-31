import Executor from "./Executor.ts";
import WorkerPoolExecutor from "./WorkerPoolExecutor.ts";

export type AbstractExecutorFactory = () => Executor;

export function defaultExecutorFactory(): Executor {
    // TODO: create default, non-worker-based executor when
    // number of CPUs is available in Deno. See: https://github.com/denoland/deno/issues/3802
    return new WorkerPoolExecutor();
}

export * from "./Executor.ts";
export * from "./WorkerPoolExecutor.ts";
