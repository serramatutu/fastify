self.onmessage = async (e) =>{ 
    let fun = eval("(" + e.data.code + ")");
    const message = {
        requestId: e.data.requestId,
        result: fun(...e.data.args)
    }
    self.postMessage(message);
}
