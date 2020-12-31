import {
    Executor,
    AbstractExecutorFactory,
    defaultExecutorFactory,
} from "./executor/mod.ts";

export type MapFunction<T, R> = (element: T, index?: number, array?: T[]) => R;

export type FilterFunction<T> = (element: T, index?: number, array?: T[]) => boolean;

type FastifyAtomicOperation<T> = (executor: Executor) => Promise<T>;

type FastifyChunkableOperation<T> = (executor: Executor) => Promise<T>[];

type FastifyOperation<T> = FastifyChunkableOperation<T> | FastifyAtomicOperation<T>;

function chunkDataIntoPromises<T>(data: T[], chunks: number): Promise<T[]>[] {
    const promises: Promise<T[]>[] = [];

    const chunkSize = Math.ceil(data.length / chunks);
    for (let i = 0; i < data.length; i += chunkSize) {
        promises.push(
            new Promise((resolve) => {
                resolve(data.slice(i, i + chunkSize));
            })
        );
    }

    return promises;
}

abstract class FastifyBase<T, O extends FastifyOperation<T>> {
    readonly executorFactory: AbstractExecutorFactory;

    protected _previousOperation: O;

    protected constructor(
        previousOperation: O,
        executorFactory: AbstractExecutorFactory = defaultExecutorFactory
    ) {
        this._previousOperation = previousOperation;
        this.executorFactory = executorFactory;
    }

    async get(executor?: Executor): Promise<T> {
        let createdExecutor = false;
        if (!executor) {
            createdExecutor = true;
            executor = this.executorFactory();
            executor.start();
        }

        const result = await this._run(executor);

        if (createdExecutor) {
            executor.stop();
        }

        return result;
    }

    protected abstract _run(executor: Executor): Promise<T>;
}

// TODO: ensure properly that T is array. For now, doing this via init() method.
class FastifyArray<T> extends FastifyBase<T[], FastifyChunkableOperation<T[]>> {
    static init<T>(data: T[]): FastifyArray<T> {
        const op = (executor: Executor) =>
            chunkDataIntoPromises(data, executor.parallelizationCapacity);
        return new FastifyArray(op);
    }

    map<R>(fun: MapFunction<T, R>): FastifyArray<R> {
        const op = (executor: Executor) => {
            const dataPromises = this._previousOperation(executor);

            return dataPromises.map((dataPromise) => {
                return new Promise<R[]>((resolve, reject) => {
                    dataPromise
                        .then(async (data: T[]) => {
                            // TODO: use executor
                            // const transform = (d: T[]) => d.map(fun);
                            // const transformed = await wp.run(transform, [data]);
                            const transformed = data.map(fun);
                            resolve(transformed);
                        })
                        .catch(reject);
                });
            });
        };

        return new FastifyArray(op);
    }

    filter(fun: FilterFunction<T>): FastifyArray<T> {
        const op = (executor: Executor) => {
            const dataPromises = this._previousOperation(executor);

            return dataPromises.map(async (dataPromise) => {
                return new Promise<T[]>((resolve, reject) => {
                    dataPromise
                        .then(async (data: T[]) => {
                            // TODO: use executor
                            // const filter = (d: T[]) => d.filter(fun);
                            // const filtered = await wp.run(filter, [data]);
                            const filtered = data.filter(fun);
                            resolve(filtered);
                        })
                        .catch(reject);
                });
            });
        };

        return new FastifyArray(op);
    }

    protected async _run(executor: Executor): Promise<T[]> {
        const dataPromises = this._previousOperation(executor);
        const dataMatrix = await Promise.all(dataPromises);
        const flattenedData: T[] = [];
        for (const array of dataMatrix) {
            for (const value of array) {
                flattenedData.push(value);
            }
        }

        return flattenedData;
    }
}

class FastifyValue<T> extends FastifyBase<T, FastifyAtomicOperation<T>> {
    static init<T>(data: T): FastifyValue<T> {
        const op = async () => data;
        return new FastifyValue(op);
    }

    protected async _run(executor: Executor): Promise<T> {
        return await this._previousOperation(executor);
    }
}

export { FastifyArray, FastifyValue };
