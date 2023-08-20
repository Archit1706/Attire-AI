from pyngrok import ngrok
import requests, os

SD_URL = requests.get("https://server.sidd065.repl.co/sd").json().get("url")
LOCAL_SD_URL = "http://192.168.29.230:7860"
LOCAL_SD_URL = SD_URL #Use on any network


IMAGE_DIRECTORY = r"/home/siddharth/stable-diffusion-webui/outputs/"


LLAMA_URL = "http://localhost:8000"


REMOTE_URL = ngrok.connect(7777)
requests.post('https://server.sidd065.repl.co/set', json={"url":REMOTE_URL.public_url, "key":"backend"})


if not os.path.exists("cache"): os.mkdir("cache")
