const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT;
const publicDir = path.join(__dirname, '../public');

app.use(express.static(publicDir));

app.get('', (req, res) => {
	res.render('index');
});

// app.get('chat', (req, res) => {
// 	res.render('chat');
// });

io.on('connection', socket => {
	console.log('new websocket connection');

	socket.on('join', ({ username, room }) => {
		socket.join(room);

		socket.emit('message', generateMessage('Welcome'));
		socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`));
	});

	socket.on('messageSent', (message, callback) => {
		const filter = new Filter();
		if (filter.isProfane(message)) {
			return callback('No cursing');
		}
		io.to('Krom').emit('message', generateMessage(message));
		callback();
	});

	socket.on('position', ({ longitude, latitude }, callback) => {
		callback();
		io.emit('locationMessage', generateLocationMessage(longitude, latitude));
	});

	socket.on('disconnect', () => {
		io.to('Krom').emit('message', generateMessage('User has left the room'));
	});
});

server.listen(port, () => {
	console.log('Server up on port ' + port);
});
