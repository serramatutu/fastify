import WorkerPool from './WorkerPool';

export type MapFunction<T, R> = (data: T[]) => R[];

interface MapOperation<T, R> {
    type: "map";
    fun: MapFunction<T, R>;
}

export type FilterFunction<T> = (data: T[]) => T[];

interface FilterOperation<T> {
    type: "filter",
    fun: FilterFunction<T>
}

type Operation<T, R> = 
    MapOperation<T, R> | 
    FilterOperation<T>;

function _cast<T, NT>(instance: Fastify<T>): Fastify<NT> {
    return instance as unknown as Fastify<NT>;
}

export class Fastify<T> {
    public readonly workers: number = 4;

    private _ops: Operation<unknown, unknown>[];

    private _data: T[];

    constructor(data: T[], options?: Partial<Fastify<T>>) { 
        Object.assign(this, options)
        this._data = data;
    }

    map<R>(fun: MapFunction<T, R>): Fastify<R> {
        this._ops.push({
            type: "map",
            fun: fun
        });

        return _cast<T, R>(this);
    }

    filter(fun: FilterFunction<T>): Fastify<T> {
        this._ops.push({
            type: "filter",
            fun: fun
        });

        return this;
    }

    run(workerPool?: WorkerPool): T[] {
        return this._data;
    }
}

export default Fastify;