import Executor from "./Executor.ts";

type SerializedValue<T> = T extends (...args: any[]) => any ? string : T;

type Serialized<T> = T extends Array<infer P>
    ? SerializedValue<P>[]
    : SerializedValue<T>;
// T extends { [key: string]: infer P} ?
//     { [key: string]: SerializedValue<P>}
//     : SerializedValue<T>;

interface WorkerMessageData<F extends (...args: any[]) => any> {
    requestId: number;
    serializedArgs: Serialized<Parameters<F>>;
    functionArgIndexes: number[];
    code: string;
}

let f = (a: number) => 1;
let a: Serialized<typeof f>;

export class WorkerPoolExecutor implements Executor {
    public readonly workers = 4;
    public readonly allowDeno = false;

    private _running = false;

    private _workers: Worker[] = [];
    private _idleWorkers: number[] = [];

    constructor(options?: Partial<WorkerPoolExecutor>) {
        Object.assign(this, options);
    }

    get running() {
        return this._running;
    }

    get idleWorkers() {
        return this._idleWorkers.length;
    }

    get activeWorkers() {
        return this.workers - this.idleWorkers;
    }

    get parallelizationCapacity() {
        return this.workers;
    }

    private _initializeWorker(index: number): Worker {
        const name = `FastifyWorker_${index}`;
        const worker = new Worker(new URL("./_worker.js", import.meta.url).href, {
            name: name,
            type: "module",
            deno: this.allowDeno,
        });

        return worker;
    }

    start() {
        if (this._running) {
            throw new Error("WorkerPoolExecutor is already running.");
        }

        for (let i = 0; i < this.workers; i++) {
            this._workers.push(this._initializeWorker(i));
            this._idleWorkers.push(i);
        }

        this._running = true;
    }

    stop() {
        if (!this._running) {
            throw new Error("WorkerPoolExecutor is already stopped.");
        }

        for (const worker of this._workers) {
            worker.terminate();
        }

        this._workers = [];
        this._idleWorkers = [];
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

    private _serializeArg<T>(arg: T): SerializedValue<T> {
        if (typeof arg === "function") {
            let funcArg = (arg as unknown) as (...args: any[]) => any;
            return this._getFunctionSource(funcArg) as SerializedValue<T>;
        }

        return arg as SerializedValue<T>;
    }

    // TODO: maybe recursive? maybe type this better -> Parameters<F> = T
    private _getSerializedArgs<F extends (...args: any[]) => any>(
        args: Parameters<F>
    ): [Serialized<Parameters<F>>, number[]] {
        const indexes: number[] = [];
        const serialized = args.map((arg, index) => {
            // TODO: careful with stuff like Object.create(Function)
            if (typeof arg === "function") {
                indexes.push(index);
                let funcArg = (arg as unknown) as (...args: any[]) => any;
                return this._getFunctionSource(funcArg);
            }

            return arg;
        });

        return [serialized as Serialized<Parameters<F>>, indexes];
    }

    async run<F extends (...args: any[]) => any>(
        fun: F,
        args: Parameters<F>
    ): Promise<ReturnType<F>> {
        if (!this._running) {
            throw new Error("Cannot run function on stopped WorkerPoolExecutor.");
        }

        const workerIndex = this._idleWorkers.shift();
        // TODO: maybe add job queue? for now throws
        if (typeof workerIndex !== "number") {
            throw new Error("WorkerPoolExecutor exhausted.");
        }

        const worker = this._workers[workerIndex];

        const [serializedArgs, functionArgIndexes] = this._getSerializedArgs<F>(
            args
        );
        const message: WorkerMessageData<F> = {
            requestId: 0, // TODO: for now
            serializedArgs: serializedArgs,
            functionArgIndexes: functionArgIndexes,
            code: this._getFunctionSource(fun),
        };

        const promise: Promise<ReturnType<F>> = new Promise((resolve, reject) => {
            worker.postMessage(message);
            worker.onmessage = (e: MessageEvent<ReturnType<F>>) => {
                resolve(e.data.result);
            };
            worker.onerror = (e: ErrorEvent) => {
                reject(e.message);
            };
        });
        promise.finally(() => {
            this._idleWorkers.push(workerIndex);
        });

        return promise;
    }
}

export default WorkerPoolExecutor;
