import pymongo
import naive_document_summarization
import frequency_summarizer
import pprint


# connect to mongod instance
client = pymongo.MongoClient()

# get database
db = client.exciting
pp = pprint.PrettyPrinter(indent=2)
'''
Uses the word-based frequency summarizer / extractor and the first round of
our k-means clustering results. Creates a document by concatenating together
all of the extractions within a cluster, then uses the summarizer on that document
to return 1 sentence.
'''
def main():
  paper_summaries = get_summaries()  
  
  for paper_id in sorted(paper_summaries):
    pp.pprint(paper_id)
    pp.pprint(paper_summaries[paper_id])

  # pp.pprint(paper_summaries)


def get_summaries():
  summarizer = frequency_summarizer.FrequencySummarizer()

  # get collection
  collection = db.clusters
  clusters = collection.find()

  paper_summaries = {}
  for doc in clusters:
    cluster1summary = summarizer.summarize(".".join(doc[u'0']), 1) if u'0' in doc else ""
    cluster2summary = summarizer.summarize(".".join(doc[u'1']), 1) if u'1' in doc else ""
    cluster3summary = summarizer.summarize(".".join(doc[u'2']), 1) if u'2' in doc else ""
    
    paper_summaries[doc[u'cited_paper']] = [cluster1summary, cluster2summary, cluster3summary]
  return paper_summaries


def get_summaries_for_paper(paper_id):
  summarizer = frequency_summarizer.FrequencySummarizer()
  collection = db.clusters2
  clusters = collection.find({"cited_paper" : paper_id})
  summaries = []
  for doc in clusters:
    summaries.append(summarizer.summarize(".".join(doc[u'0']), 1) if u'0' in doc else "")
    summaries.append(summarizer.summarize(".".join(doc[u'1']), 1) if u'1' in doc else "")
    summaries.append(summarizer.summarize(".".join(doc[u'2']), 1) if u'2' in doc else "")

  return summaries

# def compare_to_naive():
#   k_means = get_summaries()
#   naive = naive_document_summarization.get_summaries()

#   k_paper_ids =sorted(k_means)
#   # naive_paper_ids =sorted(naive)
#   for paper_id in k_paper_ids:
#     print "Comparing"


if __name__ == '__main__':
  main()