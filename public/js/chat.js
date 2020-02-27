const socket = io();
const $message = document.querySelector("#messages");
const $chatRoom = document.querySelector("#chatList");

const $message_template = document.querySelector("#message-template").innerHTML;
const $location_template = document.querySelector("#location-template")
	.innerHTML;
const $sidebar_template = document.querySelector("#sidebar-template").innerHTML;

const { username: userName, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true
});

const autoscroll = () => {
	const $latest_Message = $message.lastElementChild; //latest message
	const $message_height = $latest_Message.offsetHeight; //latest message height without margin and other calc.
	const $message_style = getComputedStyle($latest_Message); //get all styles applied  for the latest message
	const $visibleHeight = $message.offsetHeight; // visible height
	const $contentHeight = $message.scrollHeight; // container height
	const $scrollOffset = $message.scrollTop + $visibleHeight; //how far is scrolled
	const $newMsgHeight =
		$message_height + parseInt($message_style.marginBottom);

	if ($contentHeight - $newMsgHeight <= $scrollOffset) {
		$message.scrollTop = $message.scrollHeight;
	}
};

socket.emit("join", { userName, room }, error => {
	if (error) {
		alert(error);
		location.href = "/";
	}
});

socket.on("refreshUserList", ({ users, room }) => {
	const html = Mustache.render($sidebar_template, {
		room,
		users
	});

	document.querySelector("#sidebar").innerHTML = html;
});

socket.on("newMember", greet => {
	const html = Mustache.render($message_template, {
		userName: greet.sender,
		createdAt: moment(greet.createdAt).format("HH:MM:SS a"),
		message: greet.text
	});
	$message.insertAdjacentHTML("beforeend", html);
});

socket.on("newMessage", value => {
	const html = Mustache.render($message_template, {
		userName: value.sender,
		createdAt: moment(value.createdAt).format("HH:MM:SS a"),
		message: value.text
	});
	$message.insertAdjacentHTML("beforeend", html);
	autoscroll();
});

socket.on("locationMessage", linkText => {
	const html = Mustache.render($location_template, {
		userName: linkText.sender,
		createdAt: moment(linkText.createdAt).format("HH:MM:SS a"),
		link: linkText.url
	});
	$message.insertAdjacentHTML("beforeend", html);
	autoscroll();
});

document.querySelector("#chatBot").addEventListener("submit", event => {
	event.preventDefault();
	let message = event.target.elements.textMsg.value;
	let submitBtn = event.target.elements.submitBtn;
	submitBtn.disabled = true;

	socket.emit("sendMessage", message, error => {
		submitBtn.disabled = false;
		event.target.elements.textMsg.value = "";

		if (error) {
			return console.log(error);
		}
		console.log(`message delivered`);
	});
});

document.querySelector("#shareLocation").addEventListener("click", event => {
	if (!navigator.geolocation) {
		return alert("Your browser does not support GeoLocation");
	}

	let shareLocationBtn = event.target;
	shareLocationBtn.disabled = true;

	navigator.geolocation.getCurrentPosition(position => {
		let location = {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		};
		socket.emit("sendLocation", location, message => {
			console.log(message);
		});
		shareLocationBtn.disabled = false;
	});
});
