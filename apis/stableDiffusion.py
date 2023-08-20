from flask import request, jsonify
from PIL import Image
import requests
import os
import webuiapi
from datetime import datetime

from apis.pil_tools import urlToImage, base64ToImage
from apis.language_tools import filterCaptions


class sdapi:
    def __init__(self, app, directory, sdurl, localurl) -> None:
        self.app = app
        self.directory = directory
        self.sdurl = localurl
        self.shareurl = sdurl
        self.api = webuiapi.WebUIApi(host='0.0.0.0', port=7860)
        self.routes = {
            '/api/sdapi/img2img': {
                'function': self.img2img,
                'methods': ['POST']
            },
            '/api/sdapi/txt2img': {
                'function': self.txt2img,
                'methods': ['POST']
            },
            '/api/sdapi/resize': {
                'function': self.resize,
                'methods': ['POST']
            },
            '/api/sdapi/upscale': {
                'function': self.upscale,
                'methods': ['POST']
            },
            '/api/sdapi/caption': {
                'function': self.caption,
                'methods': ['POST']
            },
        }

    def img2img(self):
        try:
            img2imgDirectory = self.directory + r"img2img-images/images/"
            imageURL = request.json['image']
            
            maskURL = request.json['mask']
            prompt = request.json['prompt']
            
            count = 4
            if 'count' in request.get_json(): count = request.json['count']

            gender = request.cookies.get('gender')
            if not gender:
                gender = request.json['gender'] if 'gender' in request.get_json() else "man"

            image = urlToImage(imageURL)
            maskPng = base64ToImage(maskURL)
            
            mask = Image.new("RGBA", maskPng.size, "WHITE")
            mask.paste(0, (0, 0), maskPng)
            mask = mask.convert('RGB')

            unit1 = webuiapi.ControlNetUnit(input_image=image, module='depth_zoe', model='control_v11f1p_sd15_depth [cfd03158]', weight=0.5)
            
            self.api.img2img(
                images=[image],
                mask_image=mask,
                inpainting_fill=0,
                inpaint_full_res=False,
                inpaint_full_res_padding=35,
                inpainting_mask_invert=1,#Invert from BW to WB
                prompt=f'{prompt}, 1{gender}',
                negative_prompt="epiCNegative",#"low quality, worst quality, bad anatomy, bad composition, poor, low effort, watermark, epiCNegative", #low quality, worst quality, BadDream, UnrealisticDream, black and white, holding, multiple limbs, mutated limbs, mutated human, poorly drawn human body, epiCNegative
                controlnet_units=[unit1],
                seed=-1,
                cfg_scale=10,
                steps=30,
                #batch_size=count,
                n_iter=count,
                denoising_strength=0.8,
                width=512,
                height=512,
                save_images=True,
            )
            
            images = sorted(os.listdir(img2imgDirectory), reverse=False)[-count:]
            imageURLs = [f"{self.sdurl}/file={img2imgDirectory}{image}" for image in images]
            print(imageURLs)

            return jsonify({"response":imageURLs}), 200
            #return self.app.response_class(stream(), mimetype='text/event-stream')

        except Exception as e:
            print(e)
            print(e.__traceback__.tb_next)
            return {"success": False, "error": f"an error occurred {str(e)}"}, 400
        
    def txt2img(self):
        try:
            txt2imgDirectory = self.directory + r"txt2img-images/images/"
            gender = request.cookies.get('gender')
            if not gender:
                gender = request.json['gender'] if 'gender' in request.get_json() else "man"
            userPrompt = request.json['prompt'].lower()

            additional = ''
            if 'keywords' in request.get_json(): additional = f", {request.json['keywords'].lower()}"

            standing = "((standing, wide angle, full-body shot))"
            prompt = f"((Masterpiece, best quality, photography, detailed skin, realistic, photo-realistic, 8k, highly detailed, full length frame, High detail RAW color art, well lit, sharp focus, hyperrealism, cinematic lighting)), {userPrompt}{additional}, (1{gender}:2), young, solo, simple background, looking at viewer, shirt, white background, {standing}, virtual youtuber, wearing {userPrompt}{additional}"
            
            self.api.txt2img(
                prompt=prompt,
                negative_prompt="nsfw, nudity, busty, nude, risky, naked, revealing, topless, bottomless, asian, low quality, worst quality, BadDream, UnrealisticDream, black and white, holding, multiple limbs, mutated limbs, mutated human, poorly drawn human body, epiCNegative",
                seed=-1,
                cfg_scale=7,
                restore_faces=True,
                #controlnet_units=[webuiapi.ControlNetUnit(input_image=Image.open(r"./assets/pose.png"), module='none', model='control_v11p_sd15_openpose [cab727d4]', weight=1)],
                steps=30,
                width=512,
                height=512,
                save_images=True,
            )
            images = sorted(os.listdir(txt2imgDirectory), reverse=False)[-1:]
            imageURLs = [f"{self.sdurl}/file={txt2imgDirectory}{image}" for image in images]
            print(imageURLs)
            return jsonify({"response":imageURLs}), 200

        except Exception as e:
            print(e)
            print(e.__traceback__.tb_next)
            return {"success": False, "error": f"an error occurred {str(e)}"}, 400
        
    def resize(self): 
        try:
            resizeDirectory = self.directory + r"resize-images/images/"
            imageURL = request.json['image']
            image = base64ToImage(imageURL)

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

            filename = datetime.now().strftime("%Y%m%d-%H%M%S")+".png"
            imageCrop.save(resizeDirectory+filename)
            imageURLs = [f"{self.sdurl}/file={resizeDirectory}{filename}"]
            return jsonify({"response":imageURLs}), 200

        except Exception as e:
            print(e)
            print(e.__traceback__.tb_next)
            return {"success": False, "error": f"an error occurred {str(e)}"}, 400
        
    def upscale(self):
        try:
            upscaleDirectory = self.directory + r"extras-images/"
            imageURL = request.json['image']
            image = urlToImage(imageURL)
            result = self.api.extra_single_image(
                image=image,
                upscaler_1=webuiapi.Upscaler.ESRGAN_4x,
                upscaling_resize=2
            )
            filename = datetime.now().strftime("%Y%m%d-%H%M%S")+".png"
            result.image.save(upscaleDirectory+filename)
            imageURLs = [f"{self.shareurl}/file={upscaleDirectory}{filename}"]
            #imageURLs = [f"{self.sdurl}/file={upscaleDirectory}{image}" for image in images]
            print(imageURLs)
            return jsonify({"response":imageURLs}), 200
            
        except Exception as e:
            print(e)
            print(e.__traceback__.tb_next)
            return {"success": False, "error": f"an error occurred {str(e)}"}, 400
        
    def caption(self):
        try:
            imageURL = request.json['image']
            image = urlToImage(imageURL)
            result = self.api.interrogate(
                image=image,
                model="deepdanbooru"
            )
            captions = result.info
            
            return jsonify({"response":filterCaptions(captions)}), 200
            
        except Exception as e:
            print(e)
            print(e.__traceback__.tb_next)
            return {"success": False, "error": f"an error occurred {str(e)}"}, 400
