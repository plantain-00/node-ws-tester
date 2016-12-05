"use strict";
const WebSocket = require("ws");
const minimist = require("minimist");
const bytes = require("bytes");
const argv = minimist(process.argv.slice(2), { "--": true });
const url = argv["url"] || "ws://localhost:8000";
const connectionCount = argv["connection-count"] || 100;
const connectionCountIncrease = argv["connection-count-increase"] || 0;
const increasePerSecond = argv["increase-per-second"] || 0;
console.log(`Connecting to ${url} with ${connectionCount} times.`);
const wsArray = [];
let errorCount = 0;
let messageCount = 0;
let messageTotalLength = 0;
function connect(times) {
    for (let i = 0; i < times; i++) {
        const ws = new WebSocket(url);
        wsArray.push(ws);
        ws.on("message", (data, flags) => {
            messageTotalLength += data.length;
            messageCount++;
        }).on("error", error => {
            if (error) {
                errorCount++;
            }
        });
    }
}
connect(connectionCount);
let timer;
if (connectionCountIncrease > 0 && increasePerSecond > 0) {
    console.log(`Connection increase ${connectionCountIncrease} times per ${increasePerSecond} second.`);
    timer = setInterval(() => {
        connect(connectionCountIncrease);
    }, 1000 * increasePerSecond);
}
setInterval(() => {
    if (timer && errorCount > 0) {
        clearInterval(timer);
    }
    console.log(`errors: ${errorCount} connections: ${wsArray.length} messages: ${bytes.format(messageTotalLength)} ${messageCount} memory: ${bytes.format(process.memoryUsage().rss)}`);
}, 1000);
//# sourceMappingURL=client.js.map