const socket = io();
const form = document.querySelector('form');
const input = document.querySelector('input');
const sendButton = document.querySelector('button');
const locationBtn = document.querySelector('.locationBtn');
const messages = document.querySelector('.messages');

//Templates

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

// Options

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.on('message', ({ text, createdAt }) => {
	const html = Mustache.render(messageTemplate, {
		message: text,
		createdAt: moment(createdAt).format('HH:mm')
	});
	messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', ({ coords, createdAt }) => {
	const html = Mustache.render(locationTemplate, {
		coords,
		createdAt: moment(createdAt).format('HH:mm')
	});
	messages.insertAdjacentHTML('beforeend', html);
});

form.addEventListener('submit', e => {
	e.preventDefault();

	sendButton.setAttribute('disabled', 'disabled');

	const message = e.target.elements.message.value;

	socket.emit('messageSent', message, error => {
		sendButton.removeAttribute('disabled');
		form.reset();
		input.focus();
		if (error) {
			return console.log(error);
		}

		console.log('msg delivered');
	});
});

locationBtn.addEventListener('click', () => {
	if (!navigator.geolocation) {
		return alert('Geolocation is not supported by your browser');
	}
	locationBtn.setAttribute('disabled', 'disabled');
	navigator.geolocation.getCurrentPosition(({ coords }) => {
		socket.emit(
			'position',
			{
				latitude: coords.latitude,
				longitude: coords.longitude
			},
			() => {
				locationBtn.removeAttribute('disabled');
			}
		);
	});
});

socket.emit('join', { username, room });
