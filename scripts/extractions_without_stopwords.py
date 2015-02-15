import string
import nltk
from nltk.corpus import stopwords
import pymongo

# establish a connection to the database
connection = pymongo.MongoClient("localhost", 27017)
db = connection.mongodata
collection = db.re_sentence_extractions




def main():
  
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
        "$gte" : 30
      }
    }}])

  stopset = set(stopwords.words('english'))
  results = {}
  for row in grouped_extractions['result']:
    cleaned_extractions = []
    for extraction in row[u'extractions']:
      extraction_words = string.split(extraction, " ")
      cleaned_sentence = ""
      for word in extraction_words:
        if word not in stopset:
          cleaned_sentence += word + " "

      cleaned_sentence.strip()
      cleaned_extractions.append(cleaned_sentence)

    results[row[u'_id'][u'cited_paper']] = cleaned_extractions


  # print "filtered extractions"
  # print results

  print "\n\nN03-1033"
  print results[u"N03-1033"]


if __name__ == '__main__':
  main()