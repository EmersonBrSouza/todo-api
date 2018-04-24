const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user')

const port = process.env.PORT || 3000
var app = express();

app.use(bodyParser.json())

app.post('/todos', (req,res) => {
	let todo = new Todo({
		text: req.body.text
	});

	todo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/todos', (req,res) => {
	Todo.find().then((todos)=>{
		res.send({todos});
	}, (e)=>{
		res.status(400).send(e);
	})
});

app.get('/todos/:id', (req,res) => {
	let id = req.params.id;

	let notFoundTodo = () => {
		res.status(404).send({})
		return console.log("Todo not found")
	}

	if (!ObjectID.isValid){
		return notFoundTodo();
	}

	Todo.findById(id).then((todo)=>{
		if (!todo){
			return notFoundTodo();
		}

		res.send({todo});
	}).catch((e) => {
		console.log(e);
	})
});

app.delete('/todos/:id', (req,res) => {
	let id = req.params.id;

	let notFoundTodo = () => {
		res.status(404).send({})
		return console.log("Todo not found")
	}

	if (!ObjectID.isValid){
		return notFoundTodo();
	}

	Todo.findByIdAndRemove(id).then((doc)=>{
		if (!doc){
			return notFoundTodo();
		}

		res.status(200).send({});
	}).catch((e) => {
		console.log(e);
	});
});

app.patch('/todos/:id', (req,res) => {
	let id = req.params.id;

	let notFoundTodo = () => {
		res.status(404).send({})
		return console.log("Todo not found")
	}

	if (!ObjectID.isValid){
		return notFoundTodo();
	}

	var body = _.pick(req.body, ['text','completed']);

	if (_.isBoolean(body.completed) && body.completed){
		body.completedAt = new Date().getTime()
	}else {
		body.completed = false;
	}

	Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
		if (!todo) {
		  return res.status(404).send();
		}

		res.send({todo});
	}).catch((e) => {
		res.status(400).send();
	})
});

app.post('/user/register', (req,res) => {
	var body = _.pick(req.body, ['email','password']);

	let user = new User({
		email: body.email,
		password: body.password
	});

	user.save().then(()=>{
		return user.generateAuthToken();
	}).then((token) =>
		res.header('x-auth', token).send(user)
	).catch((e)=> {
		if (e.name == "BulkWriteError" && e.code == 11000){
			res.status(400).send({
				message: "Already exists a registered email"
			})
		}else{
			res.status(400).send({
				message:e.message
			})
		}
	})
});

app.post('/user/login', (req,res) => {
	var body = _.pick(req.body, ['email','password']);

	let user = new User({
		email: body.email,
		password: body.password
	});

	User.findOne({email:user.email}).then((doc)=>{
		if (!doc){
			return res.status(404).send({message:"Not Found"});
		}

		if (doc.password == body.password){
			return res.status(200).send({success:true});
		}
		
		return res.status(200).send({success:false});
	}).catch((e)=> {
		if (e.name == "BulkWriteError" && e.code == 11000){
			res.status(400).send({
				message: "Already exists a registered email"
			})
		}else{
			res.status(400).send({
				message:e.message
			})
		}
	})
});

app.listen(port, () => {
	console.log(`Started on port ${port}`);
})

