from bs4 import BeautifulSoup
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

def req(url):
    s = requests.Session()
    retries = Retry(total=5, status_forcelist=[429, 500, 502, 503, 504])
    s.mount('https://', HTTPAdapter(max_retries=retries))
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.51"}
    return s.get(url, headers=headers, timeout=5)

def getText(url):
    try:
        response = req(url)
        soup = BeautifulSoup(response.content, features="html.parser")

        tags = ["script", "style", "img", "meta", "button", "input", "canvas", "select", "svg", "video", "progress", "a"]
        for tag in tags:
            for element in soup.find_all(tag):
                element.extract()
        text = soup.get_text()
        
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk.strip() for chunk in chunks if chunk and len(chunk)>20)
        text = ''.join([i if ord(i) < 128 else '' for i in text])
        return text
    except:
        return False

def promptEval(url, prompt):
        body = {
            "prompt": f"\n\n### Instructions: You a given a prompt. If the prompt should be handled by the internal product recommendation system respond \"0\", otherwise respond \"1\". Respond in the format of a list object in python with a single element.\n### Prompt: Recommend me some clothing Ill like\n\n### AI: [\"0\"]\n\n### Prompt: What are some top outfits for diwali\n\n### AI: [\"1\"]\n\n### Prompt: {prompt}\n\n### AI: [\"",
            "stop": ["###", "]"],
            "max_tokens":512,
            "temperature":0
        }
        req = requests.post(f"{url}/v1/completions", json = body).json()
        try:
            response = req["choices"][0]["text"]
            return "0" in response
        except:
            print("Error: ",req)
            return req
    
def generatelist(url, article, gender, keywords):
    additional = f" The products must be relvanat to \"{keywords}\"." if keywords!="" else ""
    body = {
      "prompt": f"\n\n### Instructions:\n\nCreate a list contain four names of trending product for {gender} from the article below. The list must contain real products for by {gender}.{additional} If there are no appropiate products for {gender} in the article write \"983\" in the response to get a different article. Respond in the format of a list object with 4 elements in python.\n### Article: {article}\n\n### Response: [\"",
      "stop": ["###"],
      "max_tokens":3008,
      "temperature":0
    }
    req = requests.post(f"{url}/v1/completions", json = body).json()
    try:
        result = req["choices"][0]["text"]
        if "983" in result: return False
        if not result.endswith("]"): raise("Error: UNFINISHED ARRAY")
        result = result[:-1]
        result = result.replace(", ",",").replace("\"","").split(",")
        print(result)
        return result
    except:
        print("Error: GENLIST ",req)
        return []

#"\n\n### Instructions:\n\nCreate a list contain four names of trending items of clothing for {gender} from the article below. The list must contain real items of clothing that can be worn by {gender}.{additional} If there are no appropiate clothing for {gender} in the article write \"983\" in the response to get a different article. Respond in the format of a list object with 4 elements in python.\n### Article: {article}\n\n### Response: [\"",