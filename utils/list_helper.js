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
  const authorObjects = {};
  let maxBlogsAuthor = '';
  let maxBlogs = 0;
  blogs.forEach((blog) => {
    const authorInObject = authorObjects[blog.author];
    if (authorInObject) {
      authorInObject.blogs++;
      if (authorInObject.blogs > maxBlogs) {
        maxBlogs++;
        maxBlogsAuthor = blog.author;
      }
    } else {
      authorObjects[blog.author] = { author: blog.author, blogs: 1 };
      if (1 > maxBlogs) {
        maxBlogs++;
        if (!maxBlogsAuthor) {
          maxBlogsAuthor = blog.author;
        }
      }
    }
  });
  return authorObjects[maxBlogsAuthor];
};

const mostLikes = (blogs) => {};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
