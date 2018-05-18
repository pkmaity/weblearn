const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//Get Regiter
router.get('/register',isLoggedin, function(req, res) {
	res.render('register', {title: "Registration", id:"registration"});
});

//Get Login
router.get('/login',isLoggedin, function(req, res) {
	res.render('login', {title:"Login", id:"login"});
});


//Registration
router.post('/register', function(req, res) {
	
	 const name = req.body.name;
	 const username = req.body.username;
	 const email = req.body.email;
	 const password = req.body.password;
	 const password_confirm  = req.body.password_confirm;

	 req.checkBody('name', 'Name Is Required').notEmpty();
	 req.checkBody('username', 'UserName Is Required').notEmpty();
	 req.checkBody('email', 'Email Is Required').notEmpty();
	 req.checkBody('email', 'This is not an Email').isEmail();
	 req.checkBody('password', 'Password Is Required').notEmpty();
	 req.checkBody('password_confirm', 'Retype you Password').notEmpty();
	 req.checkBody('password_confirm', 'Password do not matched').equals(req.body.password);

	 const errors = req.validationErrors();

	 if (errors) {
	 	res.render('register',{ errors : errors });
	 } else {
	 	const newUser = new User({
	 		name: name,
	 		email: email,
	 		username: username,
	 		password: password
	 	});

	 	User.createUser(newUser, function(err, user){
	 		if (err) throw err;
	 		console.log(user);
	 	});

	 	req.flash('success_msg', 'You can login now');
	 	res.redirect('/users/login');
	 }

});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user){
    	if (err) throw err;
    	if (!user) {
    		return done(null, false, {message: 'Unknown User'});
    	}

    	User.comparePassword(password, user.password, function(err, isMatch){
    		if (err) throw err;
    		if (isMatch) {
    			return done(null, user);
    		} else {
    			return done(null, false, {message: 'Invalid Password'});
    		}
    	});
    });
  }));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login', failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

//Get Register
router.get('/settings',ensureAuthenticated, function(req, res) {
	res.render('settings',{ username: req.user.name,
							userid: req.user.username,
							email: req.user.email });
});

//Change Settings
router.post('/settings', function(req, res) {
	const username = req.body.username;
	const name = req.body.name;
	const email = req.body.email;
	const newpassword = req.body.newpassword;
	const oldpassword = req.body.oldpassword;
	const password_confirm = req.body.password_confirm;

	req.checkBody('name', 'Name Is Required').notEmpty();
	req.checkBody('email', 'Email Is Required').notEmpty();
	req.checkBody('email', 'This is not an Email').isEmail();
	req.checkBody('oldpassword', 'Old Password Is Required').notEmpty();
	req.checkBody('newpassword', 'New Password Is Required').notEmpty();
	req.checkBody('password_confirm', 'Retype your New Password').notEmpty();
	req.checkBody('password_confirm', 'Password do not matched').equals(req.body.newpassword);

	const error = req.validationErrors();

	 if (error) {
	 	res.render('settings',{
	 		error:error
	 	});
	 } else {
	 	const oldUser = new User({
	 		username: username,
	 		name: name,
	 		email: email
	 	});

	User.updateUser(oldUser, function(err, user){
	 		if (err) throw err;
	 		console.log(user);
	 	});

	 	req.flash('success_msg', 'Successfully Updated');
	 	res.redirect('/users/settings');
	 }
});


function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		res.redirect('/users/login')
	}
}

function isLoggedin(req, res, next){
	if(req.isAuthenticated()){
		res.redirect('/');
	}
	else{
		return next();
	}
}

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'Successfully Logged out');
	res.redirect('/users/login');
});

module.exports = router;