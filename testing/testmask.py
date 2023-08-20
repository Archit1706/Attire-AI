#"masterpiece, best quality, 1{gender}, young, standing, wearing {userPrompt}, looking at viewer, simple background, {userPrompt}, product photo, stock photo"
#"low quality, worst quality, bad anatomy, bad composition, poor, low effort, watermark, artist name, epiCNegative",
import requests
from datetime import datetime

body = {
  "prompt":"Orange Hoodie",
  "count":4,
  "image":"https://6fef09871aed2ee599.gradio.live/file=/home/siddharth/stable-diffusion-webui/outputs/txt2img-images/images/00078-3593004021.png",
  "mask":"data:image/png;base64,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"
}

start_time = datetime.now()

requests.post("http://192.168.29.230:7777/api/sdapi/img2img", json=body)

end_time = datetime.now()

duration = end_time - start_time
print(f"Request duration: {duration}")

#0:00:49.967747