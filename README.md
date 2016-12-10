[![Dependency Status](https://david-dm.org/plantain-00/node-ws-tester.svg)](https://david-dm.org/plantain-00/node-ws-tester)
[![devDependency Status](https://david-dm.org/plantain-00/node-ws-tester/dev-status.svg)](https://david-dm.org/plantain-00/node-ws-tester#info=devDependencies)
[![Build Status](https://travis-ci.org/plantain-00/node-ws-tester.svg?branch=master)](https://travis-ci.org/plantain-00/node-ws-tester)

# node-ws-tester

### steps

1. start a server
2. start one or more client

### server

```bash
node dist/server.js
 --nouse-idle-notification
 --expose-gc
 --max-old-space-size 8192
 --port 8000
 --host localhost
 --message-count-per-second 1
 --message-length 400
 --message-count-increase 0
 --message-length-increase 0
 --increase-per-second 0
 --use-protobuf
 --custom-message
```

+ `port 8000`, `host localhost`: the port and host the server will listen to `ws://localhost:8000`.
+ `message-count-per-second 1`: the server will push 1 message to each connection every second.
+ `message-length 3`: the server will push `"aaa"`.
+ `message-count-increase 10`, `increase-per-second 2.1`: the `message-count-per-second` will increase by 10 per 2.1 seconds.
+ `message-length-increase 10`, `increase-per-second 2.1`: the `message-length` will increase by 10 per 2.1 seconds.
+ `use-protobuf`: the message will be converted to protobuf binary(defined in `message.proto`), then pushed to clients.
+ `custom-message`: the message comes from `data.json`.

### client

```bash
node dist/client.js
 --nouse-idle-notification
 --expose-gc
 --max-old-space-size 8192
 --url ws://localhost:8000
 --connection-count 4000
 --connection-count-increase 100
 --increase-per-second 2.1
```

+ `url ws://localhost:8000`: the client will connect to `ws://localhost:8000`.
+ `connection-count 4000`: the client will start 4000 connections to the server.
+ `connection-count-increase 100`, `ncrease-per-second 2.1`: the `connection-count` will increase by 100 per 2.1 seconds.
