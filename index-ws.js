const express = require('express');

const server = require('http').createServer();

const app = express();

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

server.on('request', app);
server.listen(3000, () => {
    console.log(`Server running on port 3000`);
});


const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    const numClients = wss.clients.size;
    console.log(`${numClients} Clients connected`);

    wss.broadcast(`Current visitors: ${numClients}`);

    if (ws.readyState === ws.OPEN) {
        ws.send('Welcome to the server!');
    }

    ws.on('close', () => {
        console.log('Connection closed');
        wss.broadcast(`Current visitors: ${numClients}`);
    })
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach((client) => {
        client.send(data);
    });
}