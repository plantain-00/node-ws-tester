import * as bytes from "bytes";
import { config } from "./client.config";
import * as WebSocket from "ws";

function print(message: string | Buffer) {
    // tslint:disable-next-line:no-console
    console.log(message);
}

print(`Connecting to ${config.url} with ${config.connectionCount} times.`);

const wsArray: WebSocket[] = [];
let errorCount = 0;
let messageCount = 0;
let messageTotalLength = 0;

function connect(times: number) {
    for (let i = 0; i < times; i++) {
        const ws = new WebSocket(config.url);
        wsArray.push(ws);
        ws.on("message", (data: string | Buffer, flags) => {
            messageTotalLength += data.length;
            messageCount++;
        }).on("error", error => {
            if (error) {
                errorCount++;
            }
        });
    }
}

connect(config.connectionCount);

let timer: NodeJS.Timer;
if (config.connectionCountIncrease > 0 && config.increasePerSecond > 0) {
    print(`Connection increase ${config.connectionCountIncrease} times per ${config.increasePerSecond} second.`);
    timer = setInterval(() => {
        connect(config.connectionCountIncrease);
    }, 1000 * config.increasePerSecond);
}

setInterval(() => {
    if (timer && errorCount > 0) {
        clearInterval(timer);
    }
    const memory = bytes.format(process.memoryUsage().rss);
    print(`errors: ${errorCount} connections: ${wsArray.length} messages: ${bytes.format(messageTotalLength)} ${messageCount} memory: ${memory}`);
}, 1000);
