"use strict";
const WebSocket = require("ws");
const minimist = require("minimist");
const bytes = require("bytes");
const argv = minimist(process.argv.slice(2), { "--": true });
const port = argv["port"] || 8000;
const host = argv["host"] || "localhost";
let messageCountPerSecond = argv["message-count-per-second"] || 1;
let messageLength = argv["message-length"] || 100;
const messageCountIncrease = argv["message-count-increase"] || 0;
const messageLengthIncrease = argv["message-length-increase"] || 0;
const increasePerSecond = argv["increase-per-second"] || 0;
let message = "a".repeat(messageLength);
console.log(`Listening ${host}:${port}.`);
console.log(`Sending ${bytes.format(messageLength)} message * ${messageCountPerSecond} times per second.`);
const wss = new WebSocket.Server({ port, host });
let errorCount = 0;
let messageCount = 0;
let messageTotalLength = 0;
wss.on("connection", ws => {
    const timer = setInterval(() => {
        for (let i = 0; i < messageCountPerSecond; i++) {
            ws.send(message, error => {
                if (error) {
                    errorCount++;
                }
                else {
                    messageTotalLength += messageLength;
                    messageCount++;
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
let timer;
if (increasePerSecond > 0) {
    if (messageCountIncrease > 0) {
        console.log(`Message increase ${messageCountIncrease} times per ${increasePerSecond} second.`);
        timer = setInterval(() => {
            messageCountPerSecond += messageCountIncrease;
        }, 1000 * increasePerSecond);
    }
    else if (messageLengthIncrease > 0) {
        console.log(`Message length ${messageLengthIncrease} times per ${increasePerSecond} second.`);
        timer = setInterval(() => {
            messageLength += messageLengthIncrease;
            message = "a".repeat(messageLength);
        }, 1000 * increasePerSecond);
    }
}
setInterval(() => {
    if (timer && errorCount > 0) {
        clearInterval(timer);
    }
    console.log(`errors: ${errorCount} connections: ${wss.clients.length} messages: ${bytes.format(messageTotalLength)} ${messageCount} ${messageCountPerSecond} ${messageLength} memory: ${bytes.format(process.memoryUsage().rss)}`);
}, 1000);
//# sourceMappingURL=server.js.map