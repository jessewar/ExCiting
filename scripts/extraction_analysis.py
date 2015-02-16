import string
import nltk
from nltk.corpus import stopwords
import pymongo
import requests
import json


# establish a connection to the database
connection = pymongo.MongoClient("localhost", 27017)
db = connection.mongodata
collection = db.re_sentence_extractions

def main():
  raw_extractions = get_extractions_above_threshold(30)
  # cleaned_extractions = remove_stopwords(raw_extractions)
  
  topics = lda_topics(raw_extractions["N03-1033"])
  print topics



'''
Takes: extractions = [<extraction>, <extraction>, ...]
       topics = [ { <word_in_topic_model> : <count of word>, ... } ]
Returns: [{topic: {<topic_makeup>}, extractions: [<extractions for this topic>]}, ...]
'''
# def cluster_extractions_by_topics(extractions, topics):
#   for sentence in extractions:
#     word_counts = words_and_counts(sentence)



'''
Takes: a string
Returns: {<word> : <count of word in string>, ...}
'''
def words_and_counts(string):
  counts = {}
  for word in string.split(" "):
    if word in counts:
      counts[word] += 1
    else:
      counts[word] = 1

  return counts

def lda_topics(extractions):
  payload = json.dumps( [extractions, 3] )
  head = {'Authorization': '9ec383f01ca242b3a366bc538ee50b0c', 'Content-Type' : 'application/json'}
  req = requests.post("https://api.algorithmia.com/api/kenny/LDA",data=payload, headers=head)
  parsed = json.loads(req.text)
  return parsed[u'result']


'''
Returns {'paper_id' : [<extractions>], ...}
'''
def get_extractions_above_threshold(threshold):
  grouped_extractions = collection.aggregate([
    {"$group" : {
      "_id" : {
        "cited_paper" : "$cited_paper"
      },
      "extractions": {
        "$push" : "$extraction"
      },
      "num_extractions": {
        "$sum" : 1
      }
    }},
    {"$match" : {
      "num_extractions" : {
        "$gte" : threshold
      }
    }}])

  # transform into hash we expect
  result = {}
  for row in grouped_extractions['result']:
    result[row[u'_id'][u'cited_paper']] = row[u'extractions']    


  return result

'''
Takes {'paper_id' : [<extractions>], ...}
Returns {'paper_id' : [<filtered extractions>], ...}
'''
def remove_stopwords(papers_and_extractions):
  stopset = set(stopwords.words('english'))
  results = {}
  for paper_id in papers_and_extractions:
    cleaned_extractions = []
    for extraction in papers_and_extractions[paper_id]:
      extraction_words = string.split(extraction, " ")
      cleaned_sentence = ""
      for word in extraction_words:
        if word not in stopset:
          cleaned_sentence += word + " "

      cleaned_sentence.strip()
      cleaned_extractions.append(cleaned_sentence)

    results[paper_id] = cleaned_extractions
  return results
    
if __name__ == '__main__':
  main()