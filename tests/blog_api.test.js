const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const api = supertest(app);
const helper = require('./test_helper');

const initialBlogs = helper.initialBlogs;
const oneBlog = helper.listWithOneBlog[0];

beforeEach(async () => {
  await Blog.deleteMany({});
  for (const blog of initialBlogs) {
    let blogObject = new Blog(blog);
    await blogObject.save();
  }
});

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
  await api
    .post('/api/blogs')
    .send(oneBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1);
  const contents = blogsAtEnd.map((n) => n.title);
  expect(contents).toContain('Async/await is pretty Pog');
});

test('a specific blog is within the returned blogs', async () => {
  const response = await api.get('/api/blogs');

  const contents = response.body.map((r) => r.title);
  expect(contents).toContain('Canonical string reduction');
});

test('blog without title and url is not added', async () => {
  const newBlog = {
    author: 'true',
  };

  await api.post('/api/blogs').send(newBlog).expect(400);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(initialBlogs.length);
});

test('blog without likes is added with 0 likes', async () => {
  const newBlog = {
    title: 'Test',
    author: 'true',
    url: 'hello',
  };

  await api.post('/api/blogs').send(newBlog).expect(201);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1);
});

test('blog delete works with status 204', async () => {
  const initialBlogs = await helper.blogsInDb();
  const blogToDelete = initialBlogs[0];

  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

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

afterAll(() => {
  mongoose.connection.close();
});
