import * as WebSocket from "ws";
import * as minimist from "minimist";
import * as bytes from "bytes";

const argv = minimist(process.argv.slice(2), { "--": true });

const url: string = argv["url"] || "ws://localhost:8000";

const connectionCount: number = argv["connection-count"] || 100;
const connectionCountIncrease: number = argv["connection-count-increase"] || 0;
const increasePerSecond: number = argv["increase-per-second"] || 0;

console.log(`Connecting to ${url} with ${connectionCount} times.`);

const wsArray: WebSocket[] = [];
let errorCount = 0;
let messageCount = 0;
let messageTotalLength = 0;

function connect(times: number) {
    for (let i = 0; i < times; i++) {
        const ws = new WebSocket(url);
        wsArray.push(ws);
        ws.on("message", (data, flags) => {
            messageTotalLength += (data as string).length;
            messageCount++;
        }).on("error", error => {
            if (error) {
                errorCount++;
            }
        });
    }
}

connect(connectionCount);

let timer: NodeJS.Timer;
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
