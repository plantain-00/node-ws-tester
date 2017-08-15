import * as bytes from "bytes";
import * as ProtoBuf from "protobufjs";
import * as fs from "fs";
import { config } from "./server.config";
import * as WebSocket from "uws";

function printInConsole(message: any) {
    // tslint:disable-next-line:no-console
    console.log(message);
}

printInConsole(`Listening ${config.host}:${config.port}.`);
printInConsole(`Sending ${bytes.format(config.messageLength)} message * ${config.messageCountPerSecond} times per second.`);

function readFile() {
    return new Promise<string>((resolve, reject) => {
        fs.readFile("./data.json", (error, data) => {
            if (error) {
                reject(error);
            } else {
                try {
                    const json = JSON.parse(data.toString());
                    resolve(JSON.stringify(json));
                } catch (jsonError) {
                    reject(jsonError);
                }
            }
        });
    });
}

function loadProtobuf(message: any) {
    return new Promise<Uint8Array>((resolve, reject) => {
        (ProtoBuf.load("./message.proto") as Promise<ProtoBuf.Root>).then(root => {
            const Message = root.lookup("messagePackage.Message") as ProtoBuf.Type;
            if (config.customMessage) {
                resolve(Message.encode(message).finish());
            } else {
                resolve(Message.encode({ data: message }).finish());
            }
        }, error => {
            reject(error);
        });
    });
}

async function start() {
    let message: string | Uint8Array;

    if (config.customMessage) {
        printInConsole(`Using custom message.`);
        message = await readFile();
    } else {
        message = "a".repeat(config.messageLength);
    }

    if (config.useProtobuf) {
        printInConsole(`Using protobuf.`);
        message = await loadProtobuf(message);
    }

    printInConsole(message);

    const wss = new WebSocket.Server({ port: config.port, host: config.host, clientTracking: true });

    let errorCount = 0;
    let messageCount = 0;
    let messageTotalLength = 0;

    wss.on("connection", ws => {
        const connectionTimer = setInterval(() => {
            for (let i = 0; i < config.messageCountPerSecond; i++) {
                ws.send(message, { binary: config.useProtobuf }, error => {
                    if (error) {
                        errorCount++;
                    } else {
                        messageTotalLength += config.messageLength;
                        messageCount++;
                    }
                });
            }
        }, 1000);
        ws.on("close", () => {
            clearInterval(connectionTimer);
        });
    }).on("error", error => {
        if (error) {
            errorCount++;
        }
    });

    let messageTimer: NodeJS.Timer;
    if (config.increasePerSecond > 0) {
        if (config.messageCountIncrease > 0) {
            printInConsole(`Message increase ${config.messageCountIncrease} times per ${config.increasePerSecond} second.`);
            messageTimer = setInterval(() => {
                config.messageCountPerSecond += config.messageCountIncrease;
            }, 1000 * config.increasePerSecond);
        } else if (config.messageLengthIncrease > 0) {
            printInConsole(`Message length ${config.messageLengthIncrease} times per ${config.increasePerSecond} second.`);
            messageTimer = setInterval(() => {
                config.messageLength += config.messageLengthIncrease;
                message = "a".repeat(config.messageLength);
            }, 1000 * config.increasePerSecond);
        }
    }

    setInterval(() => {
        if (messageTimer && errorCount > 0) {
            clearInterval(messageTimer);
        }
        const memory = bytes.format(process.memoryUsage().rss);
        printInConsole(`errors: ${errorCount} connections: ${wss.clients.length} messages: ${bytes.format(messageTotalLength)} ${messageCount} ${config.messageCountPerSecond} ${config.messageLength} memory: ${memory}`);
    }, 1000);
}

start();
