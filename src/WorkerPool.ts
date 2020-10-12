interface WorkerMessageData<F extends (...args: any[]) => any> {
    requestId: number;
    args: Parameters<F>;
    code: string;
}

class WorkerPool {
    public readonly workers = 4;
    public readonly allowDeno = false;

    private _running = false;

    private _workers: Worker[] = [];
    private _availableWorkers: number[] = [];

    constructor(options?: Partial<WorkerPool>) {
        Object.assign(this, options);
    }

    get running() {
        return this._running;
    }

    private _initializeWorker(): Worker {
        const worker = new Worker(new URL("./_worker.js", import.meta.url).href, {
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
            this._availableWorkers.push(i);
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
        this._availableWorkers = [];
        this._running = false;
    }

    private _getFunctionSource(fun: (...args: any[]) => any): string {
        let source = fun.toString();
        if (source.indexOf("[native code]") >= 0) {
            throw new Error(
                "Native functions are not allowed to be invoked directly. If you wish to use one, make sure to wrap it with a user-defined function."
            );
        }

        return source;
    }

    async run<F extends (...args: any[]) => any>(
        fun: F,
        args: Parameters<F>
    ): Promise<ReturnType<F>> {
        if (!this._running) {
            throw new Error("Cannot run function on stopped WorkerPool.");
        }

        const workerIndex = this._availableWorkers.shift();
        if (!workerIndex) {
            throw new Error("WorkerPool exhausted.");
        }

        const worker = this._workers[workerIndex];
        const message: WorkerMessageData<F> = {
            requestId: 0, // TODO: for now
            args: args,
            code: this._getFunctionSource(fun),
        };

        const promise: Promise<ReturnType<F>> = new Promise((resolve, reject) => {
            worker.postMessage(message);
            worker.onmessage = (e: MessageEvent<ReturnType<F>>) => {
                console.log("RESOLVE");
                resolve(e.data.result);
            };
            worker.onerror = (e: ErrorEvent) => {
                console.log("REJECT");
                reject(e.message);
            };
        });
        promise.finally(() => {
            console.log("PUSHED INDEX");
            this._availableWorkers.push(workerIndex);
        });

        return promise;
    }
}

export default WorkerPool;
