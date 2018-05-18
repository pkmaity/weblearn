const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const socketo = require('socket.io');
//const mongo = require('mongodb');
const mongoose = require('mongoose');


const routes = require('./routes/index');
const users = require('./routes/users');

// Init App 
const app = express();


app.use(express.static(path.resolve('./public')));
//View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

//BodyParser Middleware 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
//app.use(cookieParser.json());

// Set Static Foler
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	reserve:true
}));

//Passport Init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		const namespace = param.split('.')
		, root          = namespace.shift()
		, fromParam     = root;

		while(namespace.length){
			fromParam += '[' + namespace.shift() + ']';
		}
		return{
			param : fromParam,
			msg   : msg,
			value : value
		};
	}
}));

// Connect Flash
app.use(flash());

// Global vars
app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

app.use('/', routes);
app.use('/users', users);

// Set Port
app.set('port', (process.env.PORT || 3000));

var server = app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});

//Socket SetUp
var io = socketo(server);
var nicknames = [];
io.sockets.on('connection', function(socket){
	console.log('Socket Connection is Made');

	socket.on('new user', function(data, callback){
		if (nicknames.indexOf(data) != -1) {
			callback(false);
		}
		else{
			callback(true);
			console.log(socket.nickname);
			socket.nickname = data;
			nicknames.push(socket.nickname);
			
			updateNicknames();
		}
	});

	function updateNicknames(){
		io.sockets.emit('usernames', nicknames);
	}

	socket.on('send message', function(data){
		io.sockets.emit('new message', { msg: data, nick: socket.nickname});
	});

	socket.on('disconnect', function(data){
		if (!socket.nickname) return;
		nicknames.splice(nicknames.indexOf(socket.nickname), 1);
		updateNicknames();
	});
});

