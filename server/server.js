var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(8080, '127.0.0.1');

function handler (req,res){

	res.writeHead(200, {'Content-type': 'text/html'});

	var html = fs.createReadStream('./index.html', 'utf-8');

	if (req.url === '/home') {
		res.end('heelloo home');
	}

	html.pipe(res);
}


io.on('connection', function (socket) {
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('disconnect', function () {
    io.emit('user disconnected');
  });
});

console.log('Server started at 127.0.0.1:8080');