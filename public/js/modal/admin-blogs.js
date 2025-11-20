document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('blogForm');
  const status = document.getElementById('status');
  const addNewBtn = document.getElementById('addNewBtn');
  const tableBody = document.querySelector('#blogsTable tbody');

  // Load blogs on page load
  loadBlogs();

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = getFormData(form);
    const method = payload.id ? 'PUT' : 'POST';
    //const endpoint = payload.id ? `/api/blogs/${payload.id}` : '/api/admin';
    const endpoint = payload.id ? `/api/blogs/${payload.id}` : '/api/admin-blogs';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      status.textContent = `✅ Blog ${payload.id ? 'updated' : 'posted'}: ${payload.title}`;
      form.reset();
      form.id.value = '';
      loadBlogs();
    } else {
      status.textContent = `❌ Failed to ${payload.id ? 'update' : 'post'} blog.`;
    }
  });

  // Reset form for new blog
  addNewBtn.addEventListener('click', () => {
    form.reset();
    form.id.value = '';
    status.textContent = '';
  });

  // Extract form data
  function getFormData(form) {
    const title = form.title.value.trim();
    const slug = form.slug.value.trim() || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    return {
      id: form.id.value || null,
      title,
      slug,
      author: form.author.value.trim(),
      image: form.image.value.trim(),
      shortcontent: form.shortcontent.value.trim(),
      longcontent: form.longcontent.value.trim(),
      content: form.longcontent.value.trim() // legacy compatibility
    };
  }

  // Load blogs into table
  async function loadBlogs() {
    const res = await fetch('/api/blogs');
    const blogs = await res.json();
    tableBody.innerHTML = '';

    blogs.forEach(blog => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${blog.title}</td>
        <td>${blog.author}</td>
        <td>${blog.shortcontent}</td>
        <td>${blog.image}</td>
        <td>${new Date(blog.createdAt).toLocaleDateString()}</td>
        <td>
          <button onclick="editBlog(${blog.id})">✏️</button>
          <button onclick="deleteBlog(${blog.id})">🗑️</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // Edit blog
  window.editBlog = async function(id) {
    const res = await fetch(`/api/blogs/${id}`);
    const blog = await res.json();
    form.id.value = blog.id;
    form.title.value = blog.title;
    form.slug.value = blog.slug;
    form.author.value = blog.author;
    form.image.value = blog.image;
    form.shortcontent.value = blog.shortcontent;
    form.longcontent.value = blog.longcontent;
    status.textContent = `✏️ Editing blog: ${blog.title}`;
  };

  // Delete blog
  window.deleteBlog = async function(id) {
    if (!confirm("Delete this blog?")) return;
    const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
    if (res.ok) {
      status.textContent = `🗑️ Blog deleted`;
      loadBlogs();
    } else {
      status.textContent = `❌ Failed to delete blog.`;
    }
  };
});
