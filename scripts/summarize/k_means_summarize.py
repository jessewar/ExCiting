import pymongo
import frequency_summarizer
import pprint

'''
Uses the word-based frequency summarizer / extractor and the first round of
our k-means clustering results. Creates a document by concatenating together
all of the extractions within a cluster, then uses the summarizer on that document
to return 1 sentence.
'''
def main():
  # connect to mongod instance
  client = pymongo.MongoClient()

  # get database
  db = client.exciting

  # get collection
  collection = db.clusters
  clusters = collection.find()
  

  summarizer = frequency_summarizer.FrequencySummarizer()
  pp = pprint.PrettyPrinter(indent=2)

  paper_summaries = {}
  for doc in clusters:
    cluster1summary = summarizer.summarize(".".join(doc[u'0']), 1) if u'0' in doc else ""
    cluster2summary = summarizer.summarize(".".join(doc[u'1']), 1) if u'1' in doc else ""
    cluster3summary = summarizer.summarize(".".join(doc[u'2']), 1) if u'2' in doc else ""
    
    paper_summaries[doc[u'cited_paper']] = [cluster1summary, cluster2summary, cluster3summary]


  
  pp.pprint(paper_summaries)







if __name__ == '__main__':
  main()