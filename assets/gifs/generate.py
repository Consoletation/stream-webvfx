import os
import json

images = []

for f in os.listdir('.'):
    if f.endswith('.gif') or f.endswith('jpg') or f.endswith('png'):
        images.append(f)

with open('index.json', 'wb') as output:
    output.write(json.dumps(images, indent=4))
