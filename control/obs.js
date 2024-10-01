const OBSWebSocket = require('obs-websocket-js').default;
const { createInterface } = require("readline")
const WebSocket = require('ws'); // Add WebSocket library

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
})
rl.setPrompt("> ")

let socket = null

const wss = new WebSocket.Server({port: 4000});

// 1 = forward
// -1 = backward
let gridScrollDirection = 1;

const clients = [];

// Event listener for new connections
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    // Add the new client to the array
    clients.push(ws);
  
    // Handle incoming messages from clients
    ws.on('message', (message) => {
      console.log(`Received: ${message}`);
      
      // Echo the received message back to the client
      ws.send(`Server received: ${message}`);
    });
  
    // Handle client disconnection
    ws.on('close', () => {
      console.log('Client disconnected');
  
      // Remove the client from the array when they disconnect
      clients.splice(clients.indexOf(ws), 1);
    });
});



// OBS commands
async function OBS(line) {
    const command = line.split(" ")[0]
    const args = line.split(" ").slice(1)
    switch (command) {
        case "setTimer": {
            const currentSettings = await socket.call("GetInputSettings", {
                inputName: "Timer-main"
            })
            const url = new URL(currentSettings.inputSettings.url)
            url.searchParams.set("time", args[0])
            url.searchParams.set("text", args[1] ?? "Lähetys jatkuu pian :)")
            await socket.call("SetInputSettings", {
                inputName: "Timer-main",
                inputSettings: {
                    url
                },
                overlay: true
            })
            await socket.call("PressInputPropertiesButton", {
                inputName: "Timer-main",
                propertyName: "refreshnocache"
            })
            console.log("Timer reset.")
            return true
        }
        case "resetTimer": {
            await socket.call("PressInputPropertiesButton", {
                inputName: "Timer-main",
                propertyName: "refreshnocache"
            })
            console.log("Timer reset.")
            return true
        }
        case "setScene": {

            const scenes = await socket.call("GetSceneList")
            if (!scenes.scenes.map((obj) => obj.sceneName).includes(args[0])) {
                console.log("Unknown scene.")
                return true
            }
            await socket.call("SetCurrentProgramScene", {
                sceneName: args[0]
            })

            
/*   const arr = [{gridScroll: "-1*t"}, {gridScroll: "-.01*t"},
            {gridScale: "30"}, {gridScale: "5"}, {gridScale: "sin(t*1)*4+5"}];
            const randomIndex = Math.floor(Math.random() * arr.length);*/
            
            let message;
            gridScrollDirection *= -1;
            if (gridScrollDirection == -1) {
                message = {gridScroll: "-0.1*t", "turnMagnitude": 5}
            } else {
                message = {gridScroll: "-0.03*t", "turnMagnitude": 0}
            }
            message = JSON.stringify(message);

            if (clients.length != 0) {
                console.log("Sending {" + message + "}");
                clients.forEach(ws => {
                    ws.send(message);
                })
            }

            console.log(`Scene set to ${args[0]}`)
            return true
        }
        case "setFocus": {
            const currentSettings = await socket.call("GetInputSettings", {
                inputName: "Focus-view"
            })
            const url = new URL(currentSettings.inputSettings.url)
            url.searchParams.set("owner", args[0])
            await socket.call("SetInputSettings", {
                inputName: "Focus-view",
                inputSettings: {
                    url
                },
                overlay: true
            })
            await socket.call("PressInputPropertiesButton", {
                inputName: "Focus-view",
                propertyName: "refreshnocache"
            })
            console.log("Focus set.")
            return true
        }
    }
}

// Connect to OBS
; (async () => {
    socket = new OBSWebSocket()
    await socket.connect("ws://127.0.0.1:4455")
    console.log("Connected to OBS!")

    rl.prompt()
})()

rl.on("line", async (line) => {
    if (await OBS(line)) {
        rl.prompt()
        return
    }
    console.log("Unknown command.")
    rl.prompt()
})