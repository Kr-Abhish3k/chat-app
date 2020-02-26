generateMessage = (sender, text) => {
	return { sender, text, createdAt: new Date().getTime() };
};

generateLocationShareMessage = (sender, position) => {
	return {
		sender,
		createdAt: new Date().getTime(),
		url: `https://www.google.com/maps?q=${position.latitude},${position.longitude}`
	};
};

module.exports = { generateMessage, generateLocationShareMessage };
