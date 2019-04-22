const socket = io();
const form = document.querySelector('form');
const input = document.querySelector('input');
const sendButton = document.querySelector('button');
const locationBtn = document.querySelector('.locationBtn');
const messages = document.querySelector('.messages');

//Templates

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
	const newMsg = messages.lastElementChild;

	const newMsgStyles = getComputedStyle(newMsg);
	const newMsgMargin = parseInt(newMsgStyles.marginBottom);
	const newMsgHeight = newMsg.offsetHeight + newMsgMargin;
	//visible height
	const visibleHeight = messages.offsetHeight;
	//height of msg container
	const containerHeight = messages.scrollHeight;
	//How far i have scrolled
	const scrollOffset = messages.scrollTop + visibleHeight;

	if (containerHeight - newMsgHeight <= scrollOffset) {
		messages.scrollTop = messages.scrollHeight;
	}
};

socket.on('message', ({ text, createdAt, username }) => {
	const html = Mustache.render(messageTemplate, {
		username,
		message: text,
		createdAt: moment(createdAt).format('HH:mm')
	});
	messages.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('locationMessage', ({ coords, createdAt, username }) => {
	const html = Mustache.render(locationTemplate, {
		username,
		coords,
		createdAt: moment(createdAt).format('HH:mm')
	});
	messages.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users
	});
	document.querySelector('.sidebar').innerHTML = html;
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

socket.emit('join', { username, room }, error => {
	if (error) {
		alert(error);
		location.href = '/';
	}
});
