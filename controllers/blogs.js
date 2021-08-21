const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
  });
  response.json(blogs);
});

blogsRouter.get('/:id', async (request, response, next) => {
  const blog = await Blog.findById(request.params.id);
  if (blog) {
    response.json(blog);
  } else {
    response.status(404).end();
  }
});

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body;
  if (!body.title) {
    response.status(400).end();
  }
  const users = await User.find({});
  const randomUser = users[Math.floor(Math.random() * users.length)];

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: randomUser._id,
  });
  try {
    const savedBlog = await blog.save();
    randomUser.blogs = randomUser.blogs.concat(savedBlog._id);
    await randomUser.save();
    response.status(201).json(savedBlog);
  } catch (e) {
    next(e);
  }
});

blogsRouter.delete('/:id', async (req, res) => {
  await Blog.findByIdAndRemove(req.params.id);
  res.status(204).end();
});

blogsRouter.put('/:id', async (req, res) => {
  const body = req.body;

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
  };

  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    blog,
    { new: true }
  );
  res.json(updatedBlog.toJSON());
});

module.exports = blogsRouter;
