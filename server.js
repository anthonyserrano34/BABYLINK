const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let rooms = {};

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/score', (req, res) => {
    const { room, player1Score, player2Score } = req.body;
    if (rooms[room]) {
        rooms[room].player1Score = player1Score;
        rooms[room].player2Score = player2Score;
        io.to(room).emit('scoreUpdate', rooms[room]);
        res.status(200).send(rooms[room]);
    } else {
        res.status(404).send({ error: 'Room not found' });
    }
});

io.on('connection', (socket) => {
    socket.on('joinRoom', ({ room, player }) => {
        socket.join(room);

        if (!rooms[room]) {
            rooms[room] = { players: [], player1Score: 0, player2Score: 0 };
        }

        if (rooms[room].players.length < 2) {
            rooms[room].players.push(player);
        }

        io.to(room).emit('roomUpdate', rooms[room]);

        if (rooms[room].players.length === 2) {
            io.to(room).emit('gameStart', rooms[room]);
        }
    });

    // socket.on('disconnect', () => {
    // });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
