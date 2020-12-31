import Executor from "./Executor.ts";
import WorkerPoolExecutor from "./WorkerPoolExecutor.ts";

export type AbstractExecutorFactory = () => Executor;

export function defaultExecutorFactory(): Executor {
    // TODO: spawn MainThreadExecutor when number of CPUs is 1.
    // For now, number of CPUs isn't available in Deno.
    // See: https://github.com/denoland/deno/issues/3802
    return new WorkerPoolExecutor();
}

export * from "./Executor.ts";
export * from "./WorkerPoolExecutor.ts";
export * from "./MainThreadExecutor.ts";
