const OBSWebSocket = require('obs-websocket-js').default;

let socket = null;


// Connect to OBS
; (async () => {
    socket = new OBSWebSocket()
    await socket.connect("ws://127.0.0.1:4455")
    console.log("Connected to OBS!")

    // Set up listener for scene changes
    socket.on("CurrentProgramSceneChanged", () => console.log("x"));

})()