export const config = {
    url: "ws://localhost:8000", // the client will connect to ws://localhost:8000.
    connectionCount: 4000, // the client will start 4000 connections to the server.
    connectionCountIncrease: 100, // the connectionCount will increase by 100 per 2.1 seconds.
    increasePerSecond: 2.1,
};
