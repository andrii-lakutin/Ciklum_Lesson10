var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

import Routes from './routes';

var Users = [];
var Messages = [];

app.listen(8080, '127.0.0.1');

function handler (req,res){
	res.writeHead(200, {'Content-type': 'text/html'});

	if (req.url === Routes.home.url) {
		//auto redirect
		res.writeHead(302, {
			'Location': '/login'
		});
		res.end();
	} 
	else if (req.url === Routes.login.url) {
		let html = fs.createReadStream( Routes.login.template, 'utf-8');
		html.pipe(res);
	} 
	else if (req.url === Routes.chat.url) {
		let html = fs.createReadStream( Routes.chat.template, 'utf-8');
		html.pipe(res);
	} 
	else {
		res.end();
	}
}

var login = io
  .of('/login')
  .on('connection', function (socket) {
	socket.on('Can i join', function(name){
		if (Users.length < 5) {
			Users.push({name: name, socketId: null});  //socketId позже присвоится в /chat
			io.of('/chat').emit('userJoin', name);
			socket.emit('yes');
		} else{
			socket.emit('no')
		}
	});
  });


var chat = io
  .of('/chat')
  .on('connection', function (socket) {
  	//Присваиваем socket.id присоединившемуся юзеру
  	if (Users.length !== 0) {
  		Users[Users.length - 1].socketId = socket.id;
  	}
  	//Первый вход
	function LoadInfo() {
		socket.emit('loadUsers', Users);
		socket.emit('loadMessages', Messages);
	}
	LoadInfo();
	// Сообщения
	socket.on('createNewMessage', function(msg){
		var date = new Date();
		var formatedData = date.toTimeString().split(' ')[0];
		var name;
		Users.forEach((item,index) =>{
			if (item.socketId === socket.id) {
				name = item.name;
			}
		});
		//Example: 17:21:51 Freddy: Hello World!
		var bundledMessage = `${formatedData} ${name} : ${msg}`;

		Messages.push(bundledMessage);
		//Расскажем всем что пришло сообщение
		io.of('/chat').emit('newMessage', {msg : bundledMessage, from: name, sid: socket.id});
	});
	//Юзер ушел
  	socket.on('disconnect', function(){
  		Users.forEach((item, index)=>{
  			if (item.socketId === socket.id) {
  				Users.splice(index, 1);
  				io.of('/chat').emit('userDisconnect', item.name);
  			} else {
  			  	Users = Users;  //Do nothing
  			}
  		}); 
  		
  	});
  });

console.log('Server started at 127.0.0.1:8080');