import * as WebSocket from "ws";

import * as minimist from "minimist";
const argv = minimist(process.argv.slice(2), { "--": true });
const port: number = argv["port"] || 8000;
const host: string = argv["host"] || "localhost";
const messageCountPerSecond: number = argv["message-count-per-second"] || 1;
const messageLength: number = argv["message-length"] || 100;

const message = "a".repeat(messageLength);

console.log(`listening ${host}:${port} sending ${messageLength} B message * ${messageCountPerSecond} times per second.`);

const wss = new WebSocket.Server({ port, host });

let errorCount = 0;
let messageCount = 0;

wss.on("connection", ws => {
    const timer = setInterval(() => {
        for (let i = 0; i < messageCountPerSecond; i++) {
            messageCount++;
            ws.send(message, error => {
                if (error) {
                    errorCount++;
                }
            });
        }
    }, 1000);
    ws.on("close", () => {
        clearInterval(timer);
    });
}).on("error", error => {
    if (error) {
        errorCount++;
    }
});

setInterval(() => {
    console.log({
        errorCount,
        messageCount,
    });
}, 1000);
