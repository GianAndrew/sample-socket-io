const express = require('express');
const cors = require('cors');
const http = require('http');
const serverless = require('serverless-http');
const { Server } = require('socket.io');
const morgan = require('morgan');
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
    connectionStateRecovery: {},
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Hello World');
});

io.on('connection', (socket) => {
    console.log('User connected', socket.id);

    socket.on('joinRoom', (data) => {
        socket.join(data);
        console.log('User joined room: ' + data + ' with socket: ' + socket.id);
    });

    socket.on('sendMessage', (data) => {
        socket.to(data.room).emit('receiveMessage', data);
        console.log(data);
    });
    socket.on('disconnect', (reason) => {
        console.log('User disconnected', socket.id);
        console.log('Reason: ' + reason);
    });

    if (socket.recovered) {
        socket.on('sendMessage', (data) => {
            socket.to(data.room).emit('receiveMessage', data);
            console.log(data);
        });
    }
});

module.exports = app;
module.exports.handler = serverless(app);

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
