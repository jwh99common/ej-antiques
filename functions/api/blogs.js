

export async function onRequest(context) {
  const db = context.env.gallery_db;

  //console.log("🔍EJ's Antiques: D1 query triggered from /functions/api/blog.js");

  const { results } = await db.prepare("SELECT * FROM ej_antiques_blogs ORDER BY createdAt DESC").all();

//  CREATE TABLE bens_bikes_blogs (
//  id INTEGER PRIMARY KEY AUTOINCREMENT,
//  title TEXT NOT NULL,
//  slug TEXT NOT NULL,
//  author TEXT,
//  image TEXT, -- URL or path to image
//  content TEXT,
//  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
//);

  const blogs = results.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    author: p.author,
    image: p.image,
    content: p.content,
    shortcontent: p.shortcontent,
    longcontent: p.longcontent,
    createdAt: p.createdAt,
    status: p.status
  }));


  //console.log("📦 D1 returned blogs:");
  //blogs.forEach((blogs, i) => {
  //  console.log(`🔹 blogs ${i + 1}: ${blogs.title}`);
  //});

  return Response.json(blogs);
}