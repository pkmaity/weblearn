const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/loginapp');
const db = mongoose.connection;


//User Schema
const UserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	password: {
		type: String,
	},
	email: {
		type: String,
	},
	name: {
		type: String,
	}
}); 

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
        newUser.password = hash; 
        newUser.save(callback);
    });
}); 
}

module.exports.updateUser = function(oldUser, callback){
	User.update({username: oldUser.username}, {$set:{name: oldUser.name, email: oldUser.email}}, function(err, res) {
    if (err) throw err;
    console.log(oldUser.id);
    console.log(oldUser.name);
    console.log(oldUser.email);
    //console.log(User);
  });
}

module.exports.tallyPassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if (err) throw err;
    	callback(null, isMatch);
	});
}

module.exports.getUserByUsername = function(username, callback){
	const query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if (err) throw err;
    	callback(null, isMatch);
	});
}