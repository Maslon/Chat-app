const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT;
const publicDir = path.join(__dirname, '../public');

app.use(express.static(publicDir));

app.get('', (req, res) => {
	res.render('index');
});

io.on('connection', socket => {
	console.log('new websocket connection');

	socket.emit('message', generateMessage('Welcome'));
	socket.broadcast.emit('message', generateMessage('New use has joined!'));

	socket.on('messageSent', (message, callback) => {
		const filter = new Filter();
		if (filter.isProfane(message)) {
			return callback('No cursing');
		}
		io.emit('message', generateMessage(message));
		callback();
	});

	socket.on('position', ({ longitude, latitude }, callback) => {
		callback();
		io.emit('locationMessage', `https://google.com/maps?q=${latitude},${longitude}`);
	});

	socket.on('disconnect', () => {
		io.emit('message', generateMessage('Use has left the room'));
	});
});

server.listen(port, () => {
	console.log('Server up on port ' + port);
});
