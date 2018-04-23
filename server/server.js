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

app.listen(port, () => {
	console.log(`Started on port ${port}`);
})

