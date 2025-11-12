delete from ej_antiques_blogs;

insert into ej_antiques_blogs (title, slug, author, image, content, status) values
('First Blog Post', 'first-blog-post', 'Admin', 'https://example.com/image1.jpg', 'This is the content of the first blog post.', "active"),
('Second Blog Post', 'second-blog-post', 'Admin', 'https://example.com/image2.jpg', 'This is the content of the second blog post.', "active");
