export interface Executor {
    readonly parallelizationCapacity: number;

    start(): void;
    stop(): void;
    run<F extends (...args: any[]) => any>(
        fun: F,
        args: Parameters<F>
    ): Promise<ReturnType<F>>;
}

export default Executor;
