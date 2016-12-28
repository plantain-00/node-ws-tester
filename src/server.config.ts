export const config = {
    port: 8000,
    host: "localhost", // the port and host the server will listen to ws://localhost:8000.
    messageCountPerSecond: 1, // the server will push 1 message to each connection every second.
    messageLength: 400, // if 3, the server will push "aaa".
    messageCountIncrease: 0, // if 10, the messageCountPerSecond will increase by 10 per 2.1 seconds.
    messageLengthIncrease: 0, //  if 10, the messageLength will increase by 10 per 2.1 seconds.
    increasePerSecond: 2.1,
    useProtobuf: false, // the message will be converted to protobuf binary(defined in message.proto), then pushed to clients.
    customMessage: false, // the message comes from data.json.
    uws: true, // use uws rather than ws
};
