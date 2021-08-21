const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../app');
const Blog = require('../models/blog');
const api = supertest(app);
const helper = require('./test_helper');
const User = require('../models/user');

const initialBlogs = helper.initialBlogs;
const oneBlog = helper.listWithOneBlog[0];

beforeEach(async () => {
  await User.deleteMany({});
  await Blog.deleteMany({});
  const passwordHash = await bcrypt.hash('secret', 10);
  const user = new User({
    username: 'root',
    passwordHash,
  });
  await user.save();
  const passwordH = await bcrypt.hash('testing', 10);
  const user2 = new User({
    username: 'archi',
    passwordHash: passwordH,
  });
  await user2.save();
  const userBlogs = await User.findOne({ username: 'archi' });
  for (const blog of initialBlogs) {
    blog.user = userBlogs._id;
    let blogObject = new Blog(blog);
    await blogObject.save();
  }
}, 10000);

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('there are 6 blogs', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body).toHaveLength(initialBlogs.length);
});

test('id property is defined', async () => {
  const response = await api.get('/api/blogs');
  expect(response.body[1].id).toBeDefined();
});

test('the first blog is called React patterns', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body[0].title).toBe('React patterns');
});

test('a valid blog can be added ', async () => {
  let token = '';
  await api
    .post('/api/login')
    .send({ username: 'archi', password: 'testing' })
    .then((response) => {
      token = response.body.token;
    });

  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${token}`)
    .send(oneBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1);
  const contents = blogsAtEnd.map((n) => n.title);
  expect(contents).toContain('Async/await is pretty Pog');
}, 10000);

test('a specific blog is within the returned blogs', async () => {
  const response = await api.get('/api/blogs');

  const contents = response.body.map((r) => r.title);
  expect(contents).toContain('Canonical string reduction');
});

test('blog without title and url is not added', async () => {
  let token = '';
  await api
    .post('/api/login')
    .send({ username: 'archi', password: 'testing' })
    .then((response) => {
      token = response.body.token;
    });
  const newBlog = {
    author: 'true',
  };

  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${token}`)
    .send(newBlog)
    .expect(400);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(initialBlogs.length);
});

test('blog without likes is added with 0 likes', async () => {
  let token = '';
  await api
    .post('/api/login')
    .send({ username: 'archi', password: 'testing' })
    .then((response) => {
      token = response.body.token;
    });
  const newBlog = {
    title: 'Test',
    author: 'true',
    url: 'hello',
  };

  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${token}`)
    .send(newBlog)
    .expect(201);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1);
});

test('blog post fails without authorization', async () => {
  await api.post('/api/blogs').send(oneBlog).expect(401);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(initialBlogs.length);
});

test('blog delete works with status 204', async () => {
  let token = '';
  await api
    .post('/api/login')
    .send({ username: 'archi', password: 'testing' })
    .then((response) => {
      token = response.body.token;
    });
  const initialBlogs = await helper.blogsInDb();
  const blogToDelete = initialBlogs[0];

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `bearer ${token}`)
    .expect(204);

  const finalBlogs = await helper.blogsInDb();

  expect(finalBlogs).toHaveLength(initialBlogs.length - 1);

  const contents = finalBlogs.map((blog) => blog.title);

  expect(contents).not.toContain(blogToDelete.title);
});

test('blog update works with status 200', async () => {
  const initialBlogs = await helper.blogsInDb();
  const blogToUpdate = initialBlogs[1];
  const newBlog = {
    title: blogToUpdate.title,
    author: blogToUpdate.author,
    url: blogToUpdate.url,
    likes: blogToUpdate.likes + 1,
  };

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(newBlog)
    .expect(200);

  expect(response.body.likes).toBe(blogToUpdate.likes + 1);
});
describe('when there is initially one user in db', () => {
  test('creation of valid user succeeds', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'archiyop',
      name: 'Cristian F',
      password: 'secreto',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('creation of invalid user fails', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      name: 'Superuser',
      password: 'salainen',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('invalid username');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400);

    expect(result.body.error).toContain(
      'expected `username` to be unique'
    );

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
