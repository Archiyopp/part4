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
  const authorNumberOfBlogs = [];
};

const mostLikes = (blogs) => {};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
