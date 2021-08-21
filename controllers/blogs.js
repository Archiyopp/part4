const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const middleware = require('../utils/middleware');
const userExtractor = middleware.userExtractor;

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
  });
  response.json(blogs);
});

blogsRouter.get('/:id', async (request, response, next) => {
  const blog = await Blog.findById(request.params.id).populate(
    'user',
    {
      username: 1,
      name: 1,
    }
  );
  if (blog) {
    response.json(blog);
  } else {
    response.status(404).end();
  }
});

blogsRouter.post(
  '/',
  userExtractor,
  async (request, response, next) => {
    const body = request.body;
    if (!body.title) {
      response.status(400).end();
    }
    const user = await request.user;

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      user: user._id,
    });
    try {
      const savedBlog = await blog.save();
      user.blogs = user.blogs.concat(savedBlog._id);
      await user.save();
      response.status(201).json(savedBlog);
    } catch (e) {
      next(e);
    }
  }
);

blogsRouter.delete('/:id', userExtractor, async (req, res) => {
  const user = await req.user;
  const blog = await Blog.findById(req.params.id);

  if (!(blog.user.toString() === user._id.toString())) {
    return res
      .status(401)
      .json({ error: 'You are not the blog creator' });
  }
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
