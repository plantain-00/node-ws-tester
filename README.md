# node-ws-tester

### server

`node dist/server.js --message-count-per-second 1 --port 8000 --host localhost --message-length 100 --nouse-idle-notification --expose-gc --max-old-space-size=8192`

### client

`node dist/client.js --url ws://localhost:8000 --connection-count 100 --nouse-idle-notification --expose-gc --max-old-space-size=8192`
