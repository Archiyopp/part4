const bcrypt = require('bcryptjs');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogs', {
    url: 1,
    title: 1,
    author: 1,
  });
  res.json(users);
});

usersRouter.post('/', async (request, response, next) => {
  const body = request.body;
  if (!body.password || body.password.length < 4) {
    response.status(400).json({
      error: 'invalid password',
    });
  }
  if (!body.username || body.password.length < 4) {
    response.status(400).json({
      error: 'invalid username',
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name || '',
    passwordHash,
  });
  try {
    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (e) {
    next(e);
  }
});

module.exports = usersRouter;
