import os

# Path to the index.html file
file_path = os.path.join("static", "frontend", "index.html")

# Read the original content
with open(file_path, "r") as file:
    content = file.read()

# Add the {% load static %} at the beginning
content = "{% load static %}\n" + content

# Replace the assets URLs with Django static template tags
content = content.replace('src="/assets/', "src=\"{% static 'frontend/assets/")
content = content.replace('href="/assets/', "href=\"{% static 'frontend/assets/")

# Replace the ending of the script and link tags to include Django's %}
content = content.replace('.js"', ".js' %}\"")
content = content.replace('.css"', ".css' %}\"")

# Write the modified content back
with open(file_path, "w") as file:
    file.write(content)

print("index.html has been updated!")
