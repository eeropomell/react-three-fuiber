const OBSWebSocket = require('obs-websocket-js').default;
const { createInterface } = require("readline")

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
})
rl.setPrompt("> ")

let socket = null

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
       

              // add 
   
        const currentSettings = await socket.call("GetInputSettings", {
            inputName: "Browser-3"
        })
        console.log("settings",currentSettings);
        const url = new URL(currentSettings.inputSettings.url)
     //   url.searchParams.set("gridScale",32);
        console.log('u',url);


        await socket.call("PressInputPropertiesButton", {
            inputName: "Browser-3",
            propertyName: "refreshnocache"
        })
      //  await socket.call("SetCurrentProgramScene", {
      //      sceneName: args[0]
       // })


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