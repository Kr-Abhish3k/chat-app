const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const PORT = process.env.PORT || 3000;
const messageFilter = require("bad-words");

const {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom
} = require("./utils/users");

const {
	generateMessage,
	generateLocationShareMessage
} = require("./utils/messages");

let app = express();
let server = http.createServer(app);
let io = socketio(server);
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", function(req, res) {
	res.sendFile(path.resolve(__dirname, "../public/index.html"));
	res.end();
});

io.on("connection", socket => {
	console.log("web socket connected !!!!");

	socket.on("sendMessage", (value, callback) => {
		const filter = new messageFilter();
		const user = getUser(socket.id);
		if (filter.isProfane(value)) {
			return callback("Using foul language is prohobited.");
		}

		io.to(user.room).emit(
			"newMessage",
			generateMessage(user.name, value)
		);
		callback();
	});

	socket.on("sendLocation", (position, callback) => {
		const user = getUser(socket.id);
		io.to(user.room).emit(
			"locationMessage",
			generateLocationShareMessage(user.name, position)
		);
		callback("Location Shared.");
	});

	socket.on("join", (options, callback) => {
		const { error, user } = addUser({ id: socket.id, ...options });
		if (error) {
			return callback(error);
		}

		socket.join(user.room);

		socket.emit(
			"newMember",
			generateMessage("ADMIN ", `Welcome ${user.name}!!`)
		);

		io.to(user.room).emit("refreshUserList", {
			users: getUsersInRoom(user.room),
			room: user.room
		});

		socket.broadcast
			.to(user.room)
			.emit(
				"newMember",
				generateMessage(
					user.name,
					`A new member ${user.name} has joined!!.`
				)
			);
		callback();
	});

	socket.on("disconnect", () => {
		const user = removeUser(socket.id);
		if (user) {
			io.to(user.room).emit(
				"newMessage",
				generateMessage("ADMIN ", `user ${user.name} has left`)
			);
			io.to(user.room).emit("refreshUserList", {
				users: getUsersInRoom(user.room),
				room: user.room
			});
		}
	});
});

server.listen(PORT, () => {
	console.log(`server started on Port ${PORT} .`);
});
