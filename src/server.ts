import * as bytes from "bytes";
import * as ProtoBuf from "protobufjs";
import * as fs from "fs";
import { config } from "./server.config";
import * as WebSocket from "uws";

function print(message: string | Buffer) {
    // tslint:disable-next-line:no-console
    console.log(message);
}

print(`Listening ${config.host}:${config.port}.`);
print(`Sending ${bytes.format(config.messageLength)} message * ${config.messageCountPerSecond} times per second.`);

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
    return new Promise<Buffer>((resolve, reject) => {
        (ProtoBuf.load("./message.proto") as Promise<ProtoBuf.Root>).then(root => {
            const Message = root.lookup("messagePackage.Message") as ProtoBuf.Type;
            if (config.customMessage) {
                resolve(Message.encode(message).finish() as any as Buffer);
            } else {
                resolve(Message.encode({ data: message }).finish() as any as Buffer);
            }
        }, error => {
            reject(error);
        });
    });
}

async function start() {
    let message: string | Buffer;

    if (config.customMessage) {
        print(`Using custom message.`);
        message = await readFile();
    } else {
        message = "a".repeat(config.messageLength);
    }

    if (config.useProtobuf) {
        print(`Using protobuf.`);
        message = await loadProtobuf(message);
    }

    print(message);

    const wss = new WebSocket.Server({ port: config.port, host: config.host, clientTracking: true });

    let errorCount = 0;
    let messageCount = 0;
    let messageTotalLength = 0;

    wss.on("connection", ws => {
        const timer = setInterval(() => {
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
            clearInterval(timer);
        });
    }).on("error", error => {
        if (error) {
            errorCount++;
        }
    });

    let timer: NodeJS.Timer;
    if (config.increasePerSecond > 0) {
        if (config.messageCountIncrease > 0) {
            print(`Message increase ${config.messageCountIncrease} times per ${config.increasePerSecond} second.`);
            timer = setInterval(() => {
                config.messageCountPerSecond += config.messageCountIncrease;
            }, 1000 * config.increasePerSecond);
        } else if (config.messageLengthIncrease > 0) {
            print(`Message length ${config.messageLengthIncrease} times per ${config.increasePerSecond} second.`);
            timer = setInterval(() => {
                config.messageLength += config.messageLengthIncrease;
                message = "a".repeat(config.messageLength);
            }, 1000 * config.increasePerSecond);
        }
    }

    setInterval(() => {
        if (timer && errorCount > 0) {
            clearInterval(timer);
        }
        const memory = bytes.format(process.memoryUsage().rss);
        print(`errors: ${errorCount} connections: ${wss.clients.length} messages: ${bytes.format(messageTotalLength)} ${messageCount} ${config.messageCountPerSecond} ${config.messageLength} memory: ${memory}`);
    }, 1000);
}

start();
