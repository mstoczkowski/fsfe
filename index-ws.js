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

server.on('error', (err) => {
    console.log('Server error', err);
})


const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ server });

process.on('SIGINT', () => {
    wss.clients.forEach((client) => {
        client.close();
    });

    wss.close(() => {
        console.log('WSS server closed');
    });

    server.close(() => {
        shutdownDB();
    });
})

wss.on('connection', (ws) => {
    const numClients = wss.clients.size;
    console.log(`${numClients} Clients connected`);

    wss.broadcast(`Current visitors: ${numClients}`);

    if (ws.readyState === ws.OPEN) {
        ws.send('Welcome to the server!');
    }

    db.run(`
        INSERT INTO visitors (count, time)
            VALUES (${numClients}, datetime('now'))
    `);

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

// --------------------------------------------------------------------------------

const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:');

db.serialize(() => {
    console.log('DB SERIALIZED');
    db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )
    `);
});

const getCount = () => {
    console.log('DB getCount');
    db.each(`SELECT * FROM visitors`, (err, row) => {
        console.log(row);
    });
};

const shutdownDB = () => {
    getCount();
    console.log('Shutting down db');
    db.close();
};