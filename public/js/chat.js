const socket = io();
const button = document.querySelector('#increment');

socket.on('countUpdated', count => {
	console.log('Count has been updated ', count);
});

button.addEventListener('click', () => {
	socket.emit('increment');
});
