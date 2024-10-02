const OBSWebSocket = require('obs-websocket-js').default;
const { createInterface } = require("readline")
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const puppeteer = require('puppeteer');

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
})
rl.setPrompt("> ")

const app = express();
const server = http.createServer(app);
// Configure Socket.IO with CORS support
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // Allow requests from this origin
        methods: ['GET', 'POST'], // Allowed methods
        credentials: true // Optional: Allow cookies to be sent with requests
    }
});

let socket = null
let browser = page = null;
let timerPage = null;
let gridScrollDirection = -1;

io.on('connection', (socket) => {
    // .. empty for now, as we only use io.emit(...) to send to webapp
});

async function launchChromium(url) {
    browser = await puppeteer.launch({
        headless: false, 
        defaultViewport: {
            width: 1920, height: 1080
        }, // Use full size
        args: [
            "--disable-background-timer-throttling",
            "--disable-background-networking-throttling",
            "--disable-background-tab-freeze",
            "--disable-background-tab-freezetimeout",
            "--disable-backgrounding-occlude-windows",
            "--disable-renderer-backgrounding",
            "--window-position=1700,0",
            "--window-size=1920,1080",
            "--app=" + url,
        ],
    });
    console.log("Chromium launched with page: " + url);
    return browser.pages().then((pages) => pages[pages.length - 1]);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Control commands
async function Control(line) {
    const command = line.split(" ")[0]
    const args = line.split(" ").slice(1)
    switch (command) {
        case "launchOverlayWindows": {
            if (args && args.length > 0) {
                await launchChromium("http://localhost:3000/overlay/" + args[0])
                await sleep(500);
                rl.setPrompt(">");
                return true;
            }
            timerPage = await launchChromium("http://localhost:3000/overlay/timer")
            await sleep(500)
            await launchChromium("http://localhost:3000/overlay/schedule")
            await sleep(500)
            await launchChromium("http://localhost:3000/overlay/showproject")
            await sleep(500)
            await launchChromium("http://localhost:3000/overlay/interview")
            await sleep(500)
            await launchChromium("http://localhost:3000/overlay/openingscreen")
            await sleep(500)
            await launchChromium("http://localhost:3000/overlay/endingscreen")
            await sleep(500)
            await launchChromium("http://localhost:3000/scene?background=tunnel")
            rl.setPrompt(">")
            return true
        }
        case "setTimer": {

            if (timerPage) {
                await timerPage.goto("http://localhost:3000/overlay/timer?time=" + args[0] + "&text=" + args[1]);
            }

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

            gridScrollDirection *= -1;
            let message = {
                gridScroll: gridScrollDirection + "*0.1*t",
                turnMagnitude: 5
            }

            message = JSON.stringify(message);
            
            console.log("Sending {" + message + "}");
            rl.setPrompt(">")

            io.emit("msg_setParams",message);

            console.log(`Scene set to ${args[0]}`)
            rl.setPrompt(">")
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

server.listen(4000, () => {
    console.log('Socket.io server is running on port 4000');
    rl.setPrompt(">")
});

; (async () => {
    socket = new OBSWebSocket()
    await socket.connect("ws://127.0.0.1:4455")
    console.log("Connected to OBS")

    rl.prompt()
})()

rl.on("line", async (line) => {
    if (await Control(line)) {
        rl.prompt()
        return
    }
    console.log("Unknown command.")
    rl.prompt()
})