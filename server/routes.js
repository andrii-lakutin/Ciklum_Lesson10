let Routes = {
	home : {
		url : '/',
		template: null
	},

	login : {
		url : '/login',
		template: __dirname + '/templates/login.html'
	},

	chat : {
		url : '/chat',
		template: __dirname + '/templates/chat.html'
	}
};

export default Routes;