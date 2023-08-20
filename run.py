from apis.stableDiffusion import sdapi
from apis.llama import llama
from config import IMAGE_DIRECTORY, SD_URL, LLAMA_URL, REMOTE_URL, LOCAL_SD_URL
from flask import Flask
from flask_cors import CORS

print("IMAGE_DIRECTORY:", IMAGE_DIRECTORY)
print("LLAMA_URL:", LLAMA_URL)
print("SD_URL:", SD_URL)
print("LOCAL_SD_URL:",LOCAL_SD_URL)
print("NGROK URL:", REMOTE_URL.public_url)

app = Flask(__name__)
CORS(app)

if __name__ == '__main__':
    config = {
        'host' : '0.0.0.0',
        'port' : 7777,
        'debug': False
    }
    
    stableDiffusion = sdapi(app, directory=IMAGE_DIRECTORY, sdurl=SD_URL, localurl=LOCAL_SD_URL)
    for route in stableDiffusion.routes:
        app.add_url_rule(
            route,
            view_func = stableDiffusion.routes[route]['function'],
            methods   = stableDiffusion.routes[route]['methods'],
        )

    Chatbot  = llama(app, llamaurl=LLAMA_URL)
    for route in Chatbot.routes:
        app.add_url_rule(
            route,
            view_func = Chatbot.routes[route]['function'],
            methods   = Chatbot.routes[route]['methods'],
        )

    print(f"Running on port {config['port']}")
    app.run(**config)
    print(f"Closing port {config['port']}")
