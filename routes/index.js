const express = require('express');
const router = express.Router();


//Get Home Page

router.get('/',ensureAuthenticated, function(req, res) {
	res.render('index', { title:"Caht", username: req.user.name });
	//res.status(200).json({name:"SK"});
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		res.redirect('/users/login');
	}
}

module.exports = router;