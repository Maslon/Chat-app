const generateMessage = text => {
	return {
		text,
		createdAt: new Date().getTime()
	};
};

const generateLocationMessage = (latitude, longitude) => {
	return {
		coords: `https://google.com/maps?q=${longitude},${latitude}`,
		createdAt: new Date().getTime()
	};
};

module.exports = {
	generateMessage,
	generateLocationMessage
};
