import sys
#haaaccky
sys.path.append('../extract/')
sys.path.append('../cluster/')
sys.path.append('../summarize/')

import frequency_summarizer
import k_means_summarize
import pymongo
import pprint
from nltk.tokenize import sent_tokenize


# establish a connection to the database
connection = pymongo.MongoClient("localhost", 27017)
db = connection.exciting

pp = pprint.PrettyPrinter(indent=2)


def main():
  summarizer = frequency_summarizer.FrequencySummarizer()
  aggregated_results = []

  papers_abstracts = paper_ids_to_abstracts(paper_ids_corpus())
  # pp.pprint(papers_abstracts)


  for paper_id in papers_abstracts:
    aggregate = {'paper_id' : paper_id}
    abstract = summarize_abstract(summarizer, papers_abstracts[paper_id]) 
    if abstract == "":
      continue
    aggregate['abstract-summary'] = abstract
    k_means_summaries = k_means_summarize.get_summaries_for_paper(paper_id)
    pp.pprint(k_means_summaries)
    # aggregate['cluster-summary'] = k_means_summaries
    aggregated_results.append(aggregate)
    # break


  # pp.pprint(aggregated_results)


def paper_ids_corpus():
  collection = db.re_sentence_extractions
  cursor = collection.aggregate([{"$group": {"_id" : {"paper_id": "$cited_paper"}}}])
  paper_ids = []
  for doc in cursor['result']:
    paper_ids.append(doc[u'_id'][u'paper_id'])

  return paper_ids

def summarize_abstract(summarizer, abstract):
  num_sentences = len(sent_tokenize(abstract))
  return summarizer.summarize(abstract, 2) if num_sentences > 2 else abstract

def paper_ids_to_abstracts(paper_ids):
  collection = db.papers
  paper_cursor = collection.find({"paper_id" : {"$in" : paper_ids}})
  papers = {}

  for doc in paper_cursor:
    papers[doc[u'paper_id']] = doc[u'abstract']
  
  assert len(paper_ids) == len(papers)
  return papers

if __name__ == "__main__":
  main()