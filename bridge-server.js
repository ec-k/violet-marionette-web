const server = require("ws").Server;
const ws = new server({ port: 23000 });

ws.on("connection", socket => {
    console.log("connected!");

    socket.on("message", ms => {
        console.log(ms);
        ws.clients.forEach(client => {
            client.send(ms);
        });
    });

    socket.on("close", () => {
        console.log("good bye.");
    });
});