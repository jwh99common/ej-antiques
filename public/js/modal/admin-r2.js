document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const status = document.getElementById('status');
  const preview = document.getElementById('preview');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = form.file;
    const pathInput = form.path;

    if (!fileInput.files.length || !pathInput.value.trim()) {
      status.textContent = '❌ Please select a file and enter a destination path.';
      return;
    }

    const file = fileInput.files[0];
    const path = pathInput.value.trim();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const res = await fetch('/api/admin-r2', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const result = await res.json();
      status.textContent = `✅ Uploaded to: ${result.url || path}`;
      preview.src = result.url || `/r2-images/${path}`;
      preview.style.display = 'block';
    } else {
      status.textContent = '❌ Upload failed.';
      preview.style.display = 'none';
    }
  });
});
