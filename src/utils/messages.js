const generateMessage = (text, username) => {
	return {
		username,
		text,
		createdAt: new Date().getTime()
	};
};

const generateLocationMessage = (latitude, longitude, username) => {
	return {
		username,
		coords: `https://google.com/maps?q=${longitude},${latitude}`,
		createdAt: new Date().getTime()
	};
};

module.exports = {
	generateMessage,
	generateLocationMessage
};
