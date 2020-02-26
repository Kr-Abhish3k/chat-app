const users = [];
//addUser, removeUser,getUser,getUsersInRoom

const addUser = ({ id, userName, room }) => {
	if (!userName || !room) {
		return {
			error: "username and room are required."
		};
	}

	//check for exixting user
	userName = userName.trim().toLowerCase();
	const existingUser = users.find(user => {
		return user.room === room && user.name === userName;
	});
	if (existingUser) {
		return {
			error: "UserName already in use."
		};
	}

	//store User
	users.push({ id, name: userName, room });

	return { user: users[users.length - 1] };
};

const removeUser = id => {
	const index = users.findIndex(user => user.id === id);
	if (index == -1) {
		return { error: "Invalid ID provided." };
	}
	return users.splice(index, 1)[0];
};

const getUser = id => {
	return users.find(user => {
		if (user.id === id) {
			return user;
		}
	});
};

const getUsersInRoom = room => {
	return users.filter(user => user.room == room);
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
