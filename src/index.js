const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT;
const publicDir = path.join(__dirname, '../public');

app.use(express.static(publicDir));

let count = 0;

app.get('', (req, res) => {
	res.render('index');
});

io.on('connection', socket => {
	console.log('new websocket connection');

	socket.emit('countUpdated', count);

	socket.on('increment', () => {
		count++;
		// socket.emit('countUpdated', count);
		io.emit('countUpdated', count);
	});
});

server.listen(port, () => {
	console.log('Server up on port ' + port);
});
