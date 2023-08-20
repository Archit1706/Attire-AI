from PIL import Image

image = Image.open("image.jpg")
width, height = image.size
if width < height:
    newWidth = 512
    newHeight = int(height / (width / 512))
    cropTop = (newHeight - 512) // 2
    cropBottom = cropTop + 512
    crop = (0, cropTop, 512, cropBottom)
else:
    newHeight = 512
    newWidth = int(width / (height / 512))
    cropLeft = (newWidth - 512) // 2
    cropRight = cropLeft + 512
    crop = (cropLeft, 0, cropRight, 512)
imageResize = image.resize((newWidth, newHeight))
imageCrop = imageResize.crop(crop)
imageCrop.show()