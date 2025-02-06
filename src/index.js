const express = require('express');
const cors = require('cors');
const http = require('http');
const serverless = require('serverless-http');
const { Server } = require('socket.io');
const morgan = require('morgan');
const router = express.Router();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('./netlify/functions/src', router);

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
    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
});

module.exports = app;
module.exports.handler = serverless(app);

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
