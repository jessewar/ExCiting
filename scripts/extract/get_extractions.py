import string
import pymongo
import sys
import io
import pprint

# establish a connection to the database
connection = pymongo.MongoClient("localhost", 27017)
db = connection.exciting

def main():
  if len(sys.argv) < 2 or len(sys.argv) > 3:
    print("usage: python get_extractions.py from_collection_name above_threshold")
    sys.exit(1)

  collection_name = sys.argv[1]
  threshold = int(sys.argv[2]) if len(sys.argv) == 3 else 0

  extractions = above_threshold(threshold, collection_name)

  pp = pprint.PrettyPrinter(indent=2)
  pp.pprint(extractions)


'''
Returns {'paper_id' : [<extractions>], ...}
'''
def above_threshold(threshold, collection_name):
  
  grouped_extractions = db[collection_name].aggregate([
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


if __name__ == '__main__':
  main()