const OBSWebSocket = require('obs-websocket-js').default;
const { createInterface } = require("readline")
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const puppeteer = require('puppeteer');


const commands = [
    "launchOverlayWindows",
    "setTimer",
    "setScene",
    "startOutro",
    "startIntro"
];

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    completer: (line) => {
        const hits = commands.filter((cmd) => cmd.startsWith(line));
        return [hits.length ? hits : commands, line]; 
    }
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
    if (line.length == 0) {
        return true;
    }
    const command = line.split(" ")[0]
    // split by spaces but allow spaces inside "..."
    const args = line.match(/(?:[^\s"]+|"[^"]*")+/g).slice(1); 
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
            await launchChromium("http://localhost:3000/scene?background=tunnel&preset=1")
            rl.setPrompt(">")
            return true
        }
        case "setTimer": {

            if (timerPage) {
                let textParam = "";
                if (args[1] && args[1].length > 0) {
                    textParam = "&text=" + args[1];
                }
                if (args[0] && args[0].length > 0) {
                    timeParam = "time=" + args[0];
                } else {
                    timeParam = "time=" + 10*60; // 10 min by default
                }
                console.log("url","http://localhost:3000/overlay/timer?" + timeParam + textParam)
                await timerPage.goto("http://localhost:3000/overlay/timer?" + timeParam + textParam);
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

            const msg = JSON.stringify({
                gridScroll: "10"
            })
            io.emit("msg_setParams", msg)

            

            console.log(`Scene set to ${args[0]}`)
            rl.setPrompt(">")
            return true
        }
        case "startOutro": {

            io.emit("startOutro");
            await socket.call("SetCurrentProgramScene", {
                sceneName: "OnlyBackground"
            })
            return true;

        }
        case "startIntro": {
            io.emit("startIntro");
            await socket.call("SetCurrentProgramScene", {
                sceneName: "OnlyBackground"
            })
            return true;
        }
    }
}

server.listen(4000, () => {
    console.log('Socket.io server is running on port 4000');
    rl.setPrompt(">")
});

rl.on("line", async (line) => {
    if (await Control(line)) {
        rl.prompt()
        return
    }
    console.log("Unknown command.")
    rl.prompt()
})

const main = async () => {

    socket = new OBSWebSocket()
    await socket.connect("ws://127.0.0.1:4455")
    console.log("Connected to OBS")
    
    rl.prompt()
}


// to make sure that the program doesn't exit in the case of any errors
//      as that will close the overlays
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    console.log("Press any key to restart..");

    // Set up the keypress listener
    const lineHandler = () => {
        // Handle the key press
        rl.removeListener('line',lineHandler); // Remove the listener

        main(); // Restart the main function
    };

    rl.on('line', lineHandler);
});

main();