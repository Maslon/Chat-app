const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

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

	socket.on('join', ({ username, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, username, room });

		if (error) {
			return callback(error);
		}

		socket.join(user.room);

		socket.emit('message', generateMessage('Welcome'));
		socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`));
		io.to(user.room).emit('roomData', {
			users: getUsersInRoom(user.room),
			room: user.room
		});

		callback();
	});

	socket.on('messageSent', (message, callback) => {
		const filter = new Filter();
		const user = getUser(socket.id);
		if (filter.isProfane(message)) {
			return callback('No cursing');
		}
		io.to(user.room).emit('message', generateMessage(message, user.username));
		callback();
	});

	socket.on('position', ({ longitude, latitude }, callback) => {
		callback();
		const user = getUser(socket.id);

		io.to(user.room).emit('locationMessage', generateLocationMessage(longitude, latitude, user.username));
	});

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);

		if (user) {
			io.to(user.room).emit('message', generateMessage(`${user.username} has left the room`));
			io.to(user.room).emit('roomData', {
				users: getUsersInRoom(user.room),
				room: user.room
			});
		}
	});
});

server.listen(port, () => {
	console.log('Server up on port ' + port);
});
