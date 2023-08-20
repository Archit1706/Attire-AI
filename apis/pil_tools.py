import requests
import base64
from io import BytesIO
from PIL import Image

def urlToImage(url):
    image = requests.get(url)
    return Image.open(BytesIO(image.content))

def base64ToImage(base64string):
    if base64string.startswith("data:image/png;base64,"): base64string = base64string[base64string.find(",")+1:]
    return Image.open(BytesIO(base64.b64decode(base64string)))
