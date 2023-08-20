import nltk
#nltk.download('punkt')
#nltk.download('stopwords')
#nltk.download('averaged_perceptron_tagger')
#nltk.download('wordnet')
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
stopWords = set(stopwords.words("english"))

from nltk.corpus import wordnet as wn

import os

def summerize(text, strength=1.2):
    words = word_tokenize(text)
    freqTable = dict()
    for word in words:
        word = word.lower()
        if word in stopWords:
            continue
        if word in freqTable:
            freqTable[word] += 1
        else:
            freqTable[word] = 1
    sentences = sent_tokenize(text)
    sentenceValue = dict()
    for sentence in sentences:
        for word, freq in freqTable.items():
            if word in sentence.lower():
                if sentence in sentenceValue:
                    sentenceValue[sentence] += freq
                else:
                    sentenceValue[sentence] = freq
    sumValues = 0
    for sentence in sentenceValue:
        sumValues += sentenceValue[sentence]
    
    average = int(sumValues / len(sentenceValue))
    
    summary = ''
    for sentence in sentences:
        if (sentence in sentenceValue) and (sentenceValue[sentence] > (strength * average)):
            summary += " " + sentence
    return summary

def extractKeywords(text):
    text = text.lower()
    tokens = nltk.word_tokenize(text)
    tagged = nltk.pos_tag(tokens)

    rule = r"""
    NP: {<JJ.*>?<DT>?<NN.*>}
"""
    chunk_parser = nltk.RegexpParser(rule)
    chunked = chunk_parser.parse(tagged)

    chunks = []
    for subtree in chunked.subtrees(filter=lambda t: t.label() == 'NP'):
        chunks.append(' '.join([token for token, pos in subtree.leaves()]))

    output = ' '.join(chunks)
    print(output)
    return output

def checkCache(url):
    filename = url.replace("https://","").replace("http://","").replace("/","_")
    if os.path.isfile("cache/"+filename):
        with open("cache/"+filename, "r") as f:
            return f.read()
    else:
        return False

def createCache(url, text):
    filename = url.replace("https://","").replace("http://","").replace("/","_")
    with open("cache/"+filename, "w") as f:
        f.write(text)

def filterCaptions(captionStr):
    blacklist = ['background', 'hair', 'eyes']
    captions = captionStr.split(", ")
    print(captions)
    clothing_items = []
    for caption in captions:
        words = caption.split(" ")
        for word in words:
            stop = False
            for synset in wn.synsets(word):
                if any('clothing' in hypernym.name() for hypernym in synset.closure(lambda s: s.hypernyms())):
                    if not any(elem in words for elem in blacklist):
                        clothing_items.append(caption)
                    stop = True
                    break
            if stop: break

    return clothing_items