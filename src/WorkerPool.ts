

class WorkerPool {
    public readonly workers = 4;

    private _running = false;

    constructor(options: Partial<WorkerPool>) {
        Object.assign(this, options);
    }

    get running() {
        return this._running;
    }

    start() {
        this._running = true;
    }

    stop() {
        this._running = false;
    }
}

export default WorkerPool;