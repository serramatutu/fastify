function deserializeFunction(code) {
    return eval("(" + code + ")");
}

function deserializeArgs(serializedArgs, functionArgIndexes) {
    let deserializedArgs = [];
    let nextIndex = functionArgIndexes.shift();
    for (let i=0; i<serializedArgs.length; i++) {
        let deserializedArg = serializedArgs[i];
        if (nextIndex === i) {
            deserializedArg = deserializeFunction(deserializedArg);
        }

        deserializedArgs.push(deserializedArg);
    }

    return deserializedArgs;
}

self.onmessage = async (e) =>{
    let fun = deserializeFunction(e.data.code);
    let args = deserializeArgs(e.data.serializedArgs, e.data.functionArgIndexes);
    const message = {
        requestId: e.data.requestId,
        result: fun(...args)
    }
    self.postMessage(message);
}
