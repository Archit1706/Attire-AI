import requests

url = "https://7b65-2405-201-19-a0ca-bf45-44d3-1584-e5d.ngrok-free.app"

genders = ("man", "woman")
gender = genders[0]

response = requests.post(f"{url}/api/llama/prompt", 
json={"prompt":"What are some new luxury shoes?", "gender": gender}).json()

clothsList= response['response']
keywords = response['keywords']

print("CLOTHS LIST: ",clothsList, "Keywords: ", keywords)
for cloth in clothsList:
    response = requests.post(f"{url}/api/sdapi/txt2img", 
    json={"prompt":cloth, "gender": gender, "keywords":keywords}).json()
    print(response['response'])
