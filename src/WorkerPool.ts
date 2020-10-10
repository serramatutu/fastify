class WorkerPool {
    public readonly workers = 4;
    public readonly allowDeno = false;

    private _running = false;

    private _workers: Worker[] = [];
    private _availableWorkers: Set<number> = new Set();

    constructor(options?: Partial<WorkerPool>) {
        Object.assign(this, options);
    }

    get running() {
        return this._running;
    }

    private _initializeWorker(): Worker {
        const worker = new Worker(new URL("./_worker.ts", import.meta.url).href, {
            type: "module",
            deno: this.allowDeno,
        });

        return worker;
    }

    start() {
        if (this._running) {
            throw new Error("WorkerPool is already running.");
        }

        for (let i = 0; i < this.workers; i++) {
            this._workers.push(this._initializeWorker());
            this._availableWorkers.add(i);
        }

        this._running = true;
    }

    stop() {
        if (!this._running) {
            throw new Error("WorkerPool is already stopped.");
        }

        for (const worker of this._workers) {
            worker.terminate();
        }

        this._workers = [];
        this._availableWorkers = new Set();
        this._running = false;
    }

    run<F extends (...args: any[]) => any>(
        fun: F,
        args: Parameters<F>
    ): ReturnType<F> {
        if (!this._running) {
            throw new Error("Cannot run function on stopped WorkerPool.");
        }

        return fun(...args);
    }
}

export default WorkerPool;
