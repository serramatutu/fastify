import Executor from "./Executor.ts";

export class MainThreadExecutor implements Executor {
    readonly parallelizationCapacity = 1;
    start(): void {}
    stop(): void {}
    run<F extends (...args: any[]) => any>(
        fun: F,
        args: Parameters<F>
    ): Promise<ReturnType<F>> {
        return fun(...args);
    }
}

export default MainThreadExecutor;
