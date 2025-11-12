import json

def escape(text):
    return text.replace("'", "''")

with open("products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

lines = []

# Clear existing data
lines.append("DELETE FROM bens_bikes_products;")

for p in products:
    # Escape individual fields
    title = escape(p['title'])
    description = escape(p['description'])
    category = escape(p['category'])
    long_desc = escape(p['longDescription'])

    # Escape main image
    image = escape(p['image'])

    # Serialize and escape images array
    images_json = json.dumps(p['images'])  # list of strings
    images_escaped = escape(images_json)

    # Build SQL insert
    line = f"""INSERT INTO bens_bikes_products (id, title, description, price, category, image, images, longDescription)
VALUES ({p['id']}, '{title}', '{description}', {p['price']}, '{category}', '{image}', '{images_escaped}', '{long_desc}');"""
    lines.append(line)

# Optional: inspect inserted image data
lines.append("SELECT id, title, image, images FROM bens_bikes_products;")

with open("seed.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print("✅ seed.sql generated with JSON image arrays")
