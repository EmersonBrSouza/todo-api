const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

var message = "I am user number 3";
var hash = SHA256(message).toString();


// console.log('Message: ' + message)
// console.log('Hash: ' + hash)

// var data = {
// 	id: 4
// }

// var token = {
// 	data,
// 	hash: SHA256(JSON.stringify(data).toString())
// }

var data = {
	id: 10
}

var token = jwt.sign(data,'123abc');
console.log(token);