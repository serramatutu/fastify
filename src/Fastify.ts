interface Operation {
    type: "map";
}

export type WorkerFunction<T, R> = (data: T) => R;

export class Fastify {
    public readonly workers: number = 4;
    public readonly mode: "spawn" | "persist";

    private _terminated = false;
    private _workers: Worker[];

    private _ops: Operation[];
    private _data: unknown[];

    constructor(options?: Partial<Fastify>) { 
        Object.assign(this, options)

        if (this.mode === "persist") {
            this._initWorkers();    
        }
    }

    private _initWorkers() {

    }// 
    
    terminate(): Fastify {
        if (this.mode === "spawn") {
            throw new Error("Cannot terminate Executor set to 'spawn' mode.");
        }

        if (this._terminated) {
            throw new Error("Cannot terminate Executor twice.");
        }

        // TODO: kill all workers
        return this;
    }

    data<T>(data: T[]): Fastify {
        if (this._ops.length > 0) {
            throw new Error("Cannot set data on Executor with pending operations.");
        }

        this._data = data;
        return this;
    }

    map<T, R>(fun: WorkerFunction<T[], R>, data: T[]): R {
        return fun(data);
    }

    // TODO: typing
    run() {
        
    }
}

export default Fastify;