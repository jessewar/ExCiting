import sys
#haaaccky
sys.path.append('../extract/')
sys.path.append('../cluster/')
sys.path.append('../summarize/')

import frequency_summarizer
import k_means_summarize
import get_extractions
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
  paper_extractions = get_extractions.above_threshold(1, 're_sentence_extractions')

  for paper_id in papers_abstracts:
    aggregate = {'paper_id' : paper_id}
    aggregate['abstract-summary'] = summarize_abstract(summarizer, papers_abstracts[paper_id]) 
    # Throw out papers without an abstract
    if aggregate['abstract-summary'] == "":
      continue
    
    aggregate['naive-summary'] = naive_summarization(summarizer, paper_extractions[paper_id])
    # Throw out papers who had no extractions
    if aggregate['naive-summary'] == "":
      continue


    aggregated_results.append(aggregate)
  
  db.aggregated_results.drop()
  db.aggregated_results.insert(aggregated_results)

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
  return summarizer.summarize(abstract, 1)[0] if num_sentences > 1 else abstract

def naive_summarization(summarizer, extractions):
  extractions = [x.strip() for x in extractions]
  document = ". ".join(extractions) 
  summary = summarizer.summarize(document, 1)
  return summary[0] if len(summary) > 0 else ""

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