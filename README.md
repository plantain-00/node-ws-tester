[![Dependency Status](https://david-dm.org/plantain-00/node-ws-tester.svg)](https://david-dm.org/plantain-00/node-ws-tester)
[![devDependency Status](https://david-dm.org/plantain-00/node-ws-tester/dev-status.svg)](https://david-dm.org/plantain-00/node-ws-tester#info=devDependencies)
[![Build Status](https://travis-ci.org/plantain-00/node-ws-tester.svg?branch=master)](https://travis-ci.org/plantain-00/node-ws-tester)

# node-ws-tester

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
```

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
