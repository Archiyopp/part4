const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  const maxLikes = Math.max(...blogs.map((blog) => blog.likes)) || 0;
  return blogs.length > 0
    ? blogs.find((blog) => blog.likes === maxLikes)
    : {};
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null;
  const object = {};
  let maxBlogsAuthor = '';
  let maxBlogs = 0;
  blogs.forEach((blog) => {
    if (object[blog.author]) {
      object[blog.author].blogs++;
      if (object[blog.author].blogs > maxBlogs) {
        maxBlogs++;
        maxBlogsAuthor = blog.author;
      }
    } else {
      object[blog.author] = { author: blog.author, blogs: 1 };
      if (1 > maxBlogs) {
        maxBlogs++;
        if (!maxBlogsAuthor) {
          maxBlogsAuthor = blog.author;
        }
      }
    }
  });
  return object[maxBlogsAuthor];
};

const mostLikes = (blogs) => {};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
