
const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const {BlogPosts} = require('./models')

const jsonParser = bodyParser.json();
const app = express();

app.use(morgan('common'));

BlogPosts.create('Funny Blog','This is my hilarious blog.','John Doe');

app.get('/blog-posts',(req,res) => {
	res.json(BlogPosts.get());
})

app.post('/blog-posts', (req, res) => {
	const requiredFields = ['title', 'content','author'];
  	for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
    	const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  const item = BlogPosts.create(req.body.title, req.body.content,req.body.author);
  res.status(201).json(item);
})

//GET and POST requests should go to /blog-posts

//DELETE and PUT requests should go to /blog-posts/:id

//Use Express router and modularize routes to /blog-posts

app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});