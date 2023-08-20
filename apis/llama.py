import os, json
from flask import request, jsonify
from apis.recommend import fashion_recommendations
from apis.llama_tools import req, promptEval, getText, generatelist
from apis.language_tools import summerize, extractKeywords, checkCache, createCache

class llama:
    def __init__(self, app, llamaurl) -> None:
        self.app = app
        self.llamaurl = llamaurl
        self.routes = {
            '/api/llama/prompt': {
                'function': self.prompt,
                'methods': ['POST']
            }
        }

    def prompt(self):
        try:
            gender = request.cookies.get('gender')
            if not gender:
                gender = request.json['gender'] if 'gender' in request.get_json() else "man"
            gender = gender.replace("man","men")
            keywords = ''
            prompt = request.json['prompt']
            clothsList = []
            if promptEval(self.llamaurl, prompt):
                RECOMMENDATION_PATH="/home/siddharth/stable-diffusion-webui/outputs/recommend/"
                try:
                    images = os.listdir(RECOMMENDATION_PATH)
                    result={}
                    for image in images:
                        fr = fashion_recommendations(RECOMMENDATION_PATH+image, "./assets/styles.csv")
                        result.update(fr.get_recommendations())
                    return jsonify({"response":result, "keywords": keywords}), 200
                except:
                    return jsonify({"response":{"Recommendation System Error":""}, "keywords": keywords}), 400
            else:
                print("Searching the internet...")
                search = req(f'https://ddg-api.herokuapp.com/search?query={prompt} for {gender} fashion clothing article&limit=10').json()
                links = [i['link'] for i in search]
                for url in links:
                    try:
                        cache = checkCache(url)
                        if not cache:
                            text = getText(url)
                            if not text: continue
                            article = summerize(text, 1.2)
                            createCache(url, article)
                            print(url,'\n',len(text),len(article))
                        else:
                            article = cache
                            print(url,'CACHE:',len(article))
                        #print(article)
                        if (len(article) > 10000 or len(article)<500) and links.index(url)!=len(links)-1: continue
                        keywords = extractKeywords(prompt)
                        clothsList = generatelist(self.llamaurl, article, gender, keywords)
                        if len(clothsList)>1: break
                    except Exception as E:
                        print("Error: SEARCH",E,url)
                return jsonify({"response":clothsList, "keywords": keywords}), 200
        except Exception as e:
            print(e)
            print(e.__traceback__.tb_next)
            return {"success": False, "error": f"an error occurred {str(e)}"}, 400
