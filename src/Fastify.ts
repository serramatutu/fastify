import WorkerPool from "./WorkerPool";

export type MapFunction<T, R> = (data: T[]) => R[];

interface MapOperation<T, R> {
    type: "map";
    fun: MapFunction<T, R>;
}

export type FilterFunction<T> = (data: T[]) => T[];

interface FilterOperation<T> {
    type: "filter";
    fun: FilterFunction<T>;
}

type Operation<T, R> = MapOperation<T, R> | FilterOperation<T>;

function _cast<T, NT>(instance: Fastify<T>): Fastify<NT> {
    return (instance as unknown) as Fastify<NT>;
}

export class Fastify<T> {
    private _ops: Operation<unknown, unknown>[];
    private _data: T[];
    private _pending = true;

    constructor(data: T[]) {
        this._data = data;
        this._ops = [];
    }

    map<R>(fun: MapFunction<T, R>): Fastify<R> {
        this._ops.push({
            type: "map",
            fun: fun,
        });

        return _cast<T, R>(this);
    }

    filter(fun: FilterFunction<T>): Fastify<T> {
        this._ops.push({
            type: "filter",
            fun: fun,
        });

        return this;
    }

    // TODO: reduce

    run(workerPool?: WorkerPool): T[] {
        if (!this._pending) {
            throw new Error("Cannot run Fastify twice.");
        }

        // TODO: actually use workerPool
        let data: unknown[] = this._data;
        for (const op of this._ops) {
            if (op.type === "map") {
                data = op.fun(data);
            } else if (op.type === "filter") {
                data = op.fun(data);
            }
        }

        this._pending = false;
        return data as T[];
    }
}

export default Fastify;
