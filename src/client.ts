import * as WebSocket from "ws";

import * as minimist from "minimist";
const argv = minimist(process.argv.slice(2), { "--": true });

const url: string = argv["url"] || "ws://localhost:8000";
const connectionCount: number = argv["connection-count"] || 10;

const wsArray: WebSocket[] = [];
let errorCount = 0;
let messageCount = 0;

for (let i = 0; i < connectionCount; i++) {
    const ws = new WebSocket(url);
    wsArray.push(ws);
    ws.on("message", (data, flags) => {
        messageCount++;
    }).on("error", error => {
        if (error) {
            errorCount++;
        }
    });
}

setInterval(() => {
    console.log({
        errorCount,
        messageCount,
    });
}, 1000);
