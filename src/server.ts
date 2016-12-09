import * as WebSocket from "ws";
import * as minimist from "minimist";
import * as bytes from "bytes";
import * as ProtoBuf from "protobufjs";

const argv = minimist(process.argv.slice(2), { "--": true });

const port: number = argv["port"] || 8000;
const host: string = argv["host"] || "localhost";

let messageCountPerSecond: number = argv["message-count-per-second"] || 1;
let messageLength: number = argv["message-length"] || 100;
const messageCountIncrease: number = argv["message-count-increase"] || 0;
const messageLengthIncrease: number = argv["message-length-increase"] || 0;
const increasePerSecond: number = argv["increase-per-second"] || 0;
const useProtobuf: boolean = argv["use-protobuf"];

console.log(`Listening ${host}:${port}.`);
console.log(`Sending ${bytes.format(messageLength)} message * ${messageCountPerSecond} times per second.`);

if (useProtobuf) {
    console.log(`Using protobuf.`);
    (ProtoBuf.load("./message.proto") as Promise<ProtoBuf.Root>).then(root => {
        const Message = root.lookup("messagePackage.Message") as ProtoBuf.Type;
        const message = Message.encode({ data: "a".repeat(messageLength) }).finish();
        start(message);
    }, error => {
        console.log(error);
    });
} else {
    start("a".repeat(messageLength));
}

function start(message: string | Uint8Array) {
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
                    } else {
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

    let timer: NodeJS.Timer;
    if (increasePerSecond > 0) {
        if (messageCountIncrease > 0) {
            console.log(`Message increase ${messageCountIncrease} times per ${increasePerSecond} second.`);
            timer = setInterval(() => {
                messageCountPerSecond += messageCountIncrease;
            }, 1000 * increasePerSecond);
        } else if (messageLengthIncrease > 0) {
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
        const memory = bytes.format(process.memoryUsage().rss);
        console.log(`errors: ${errorCount} connections: ${wss.clients.length} messages: ${bytes.format(messageTotalLength)} ${messageCount} ${messageCountPerSecond} ${messageLength} memory: ${memory}`);
    }, 1000);
}
