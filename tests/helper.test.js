const listHelper = require('../utils/list_helper');
const helper = require('./test_helper');

const blogs = helper.initialBlogs;
const listWithOneBlog = helper.listWithOneBlog;

test('dummy returns one', () => {
  const blogs = [];

  const result = listHelper.dummy(blogs);
  expect(result).toBe(1);
});

describe('total likes', () => {
  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog);
    expect(result).toBe(20);
  });

  test('when list of blogs is empty, expect to be 0', () => {
    const result = listHelper.totalLikes([]);
    expect(result).toBe(0);
  });

  test('when there are five blogs with 36 likes it should return 36', () => {
    const result = listHelper.totalLikes(blogs);
    expect(result).toBe(36);
  });
});

describe('favorite blog', () => {
  test('when theres only one blog, returns the blog', () => {
    const result = listHelper.favoriteBlog(listWithOneBlog);
    expect(result).toEqual({
      _id: '5a422aa71b54a676234d17fd',
      title: 'Async/await is pretty Pog',
      author: 'Cristian A. Fernandez',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Poggers.html',
      likes: 20,
      __v: 0,
    });
  });

  test('when theres a list, returns the most liked', () => {
    const result = listHelper.favoriteBlog(blogs);
    expect(result).toEqual({
      _id: '5a422b3a1b54a676234d17f9',
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
      __v: 0,
    });
  });

  test('when there are 0 blogs, returns empty object', () => {
    const result = listHelper.favoriteBlog([]);
    expect(result).toEqual({});
  });
});

describe('most blogs a single author has', () => {
  test('when there is none, returns null', () => {
    const result = listHelper.mostBlogs([]);
    expect(result).toBe(null);
  });

  test('when there is one blog, returns the author and 1 blog', () => {
    const result = listHelper.mostBlogs(listWithOneBlog);
    expect(result).toEqual({
      author: 'Cristian A. Fernandez',
      blogs: 1,
    });
  });

  test('when there is a bloglist, returns the author with most blogs', () => {
    const result = listHelper.mostBlogs(blogs);
    expect(result).toEqual({
      author: 'Robert C. Martin',
      blogs: 3,
    });
  });
});

describe('most likes a single author has', () => {
  test('when there are non, returns null', () => {
    const result = listHelper.mostLikes([]);
    expect(result).toBe(null);
  });

  test('when there is one blog, returns the author and the likes', () => {
    const result = listHelper.mostLikes(listWithOneBlog);
    expect(result).toEqual({
      author: 'Cristian A. Fernandez',
      likes: 20,
    });
  });

  test('when there is a bloglist, returns the author with most likes in total', () => {
    const result = listHelper.mostLikes(blogs);
    expect(result).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 17,
    });
  });
});
