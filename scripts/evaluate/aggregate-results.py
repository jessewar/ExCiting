import sys
#haaaccky
sys.path.append('../extract/')
sys.path.append('../cluster/')
sys.path.append('../summarize/')

import frequency_summarizer
import k_means_summarize
import pymongo
import pprint

# establish a connection to the database
connection = pymongo.MongoClient("localhost", 27017)
db = connection.exciting

pp = pprint.PrettyPrinter(indent=2)


def main():
  summarizer = frequency_summarizer.FrequencySummarizer()
  aggregated_results = []

  papers_abstracts = paper_ids_to_abstracts()
  pp.pprint(papers_abstracts)


  for paper_id in papers_abstracts:
    aggregate = {'paper_id' : paper_id}
    aggregate['abstract-summary'] = summarize_abstract(summarizer, papers_abstracts[paper_id]) 
    aggregate['cluster-summary'] = k_means_summarize.get_summaries_for_paper(paper_id)
    aggregated_results.append(aggregate)


  pp.pprint(aggregated_results)



def summarize_abstract(summarizer, abstract):
  num_sentences = len(abstract.split("."))
  return summarizer.summarize(abstract, 2) if num_sentences > 2 else abstract

def paper_ids_to_abstracts():
  collection = db.papers
  paper_cursor = collection.find()
  papers = {}

  for doc in paper_cursor:
    papers[doc[u'paper_id']] = doc[u'abstract']
  return papers

if __name__ == "__main__":
  main()