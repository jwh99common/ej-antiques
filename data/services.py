import json

def escape(text):
    return text.replace("'", "''")

with open("services.json", "r", encoding="utf-8") as f:
    products = json.load(f)

lines = []

# Clear existing data
lines.append("DELETE FROM bens_bikes_services;")

for p in products:
    # Escape individual fields
    name = escape(p['title'])
    description = escape(p['description'])
    long_description = escape(p['long_description'])
    image = escape(p['image'])
    category = escape(p['category'])

    line = (
        f"INSERT INTO bens_bikes_services "
        f"(id, title, description, long_description, image, price, category) "
        f"VALUES ("
        f"{p['id']}, "
        f"'{name}', "
        f"'{description}', "
        f"'{long_description}', "
        f"'{image}', "
        f"{p['price']}, "
        f"'{category}'"
        f");"
    )


    lines.append(line)

# Optional: inspect inserted image data
lines.append("SELECT * FROM bens_bikes_services;")

with open("services.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print("✅ services.sql generated with JSON image arrays")
