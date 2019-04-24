const users = [];

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

const addUser = ({ id, username, room }) => {
	username = username.trim().toLowerCase();
	room = capitalize(room.trim());

	if (!username || !room) {
		return {
			error: 'Username and room are required'
		};
	}

	const existingUser = users.find(user => {
		return user.room === room && user.username === username;
	});

	if (existingUser) {
		return {
			error: 'User already exists in the room'
		};
	}

	const user = { id, username, room };
	users.push(user);
	return { user };
};

const removeUser = id => {
	const userIndex = users.findIndex(user => user.id === id);

	if (userIndex !== -1) {
		return users.splice(userIndex, 1)[0];
	}
};

const getUser = id => {
	return users.find(user => user.id === id);
};

const getUsersInRoom = room => {
	return users.filter(user => user.room === room);
};

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom
};
