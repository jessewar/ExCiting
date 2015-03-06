import sys
#haaaccky
sys.path.append('../extract/')
sys.path.append('../cluster/')
sys.path.append('../summarize/')

import sentences_with_ngram
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
    aggregate = {'paper_id' : paper_id, 'summaries' : []}
    
    summary = {'name' : 'abstract-summary', 'summary' : summarize_abstract(summarizer, papers_abstracts[paper_id])}
    # Throw out papers without an abstract
    if summary['summary'] == "":
      continue
    aggregate['summaries'].append(summary)
    
    summary = {'name' : 'naive-summary', 'summary' : naive_summarization(summarizer, paper_extractions[paper_id])}
    # Throw out papers who had no extractions
    if summary['summary'] == "":
      continue
    aggregate['summaries'].append(summary)

    ngram = ngram_for_paper(paper_id)
    # print ngram

    summary = {'name' : 'best-ngram-sentence', 'summary' : best_ngram_sentence(summarizer, ngram, paper_extractions[paper_id]), 'ngram' : ngram}
    if summary['summary'] == "":
      continue
    aggregate['summaries'].append(summary)

    summary = {'name' : 'longest-ngram-sentence', 'summary' : longest_ngram_sentence(ngram, paper_extractions[paper_id]), 'ngram' : ngram}
    if summary['summary'] == "":
      continue
    aggregate['summaries'].append(summary)
    
    aggregated_results.append(aggregate)
  
  db.aggregated_results.drop()
  db.aggregated_results.insert(aggregated_results)

  # pp.pprint(aggregated_results)

def ngram_for_paper(paper_id):
  cursor = db.best_ngrams.find({"cited_paper" : paper_id})
  for doc in cursor:
    return doc[u'ngram']

def best_ngram_sentence(summarizer, ngram, extractions):
  if ngram is not None:
    sentences = sentences_with_ngram.sentences_containing_ngram(extractions, ngram)
    if len(sentences) == 0:
      return ""
    document = ". ".join(sentences) 
    result = summarizer.summarize(document, 1)
    if len(result) == 0:
      return ""
    return result[0]
  else:
    return ""

def longest_ngram_sentence(ngram, extractions):
  if ngram is not None:
    sentences = sentences_with_ngram.sentences_containing_ngram(extractions, ngram)
    if len(sentences) == 0:
      return ""
    in_order = sorted(sentences, key=len)
    return in_order[-1].strip() + "."
  else:
    return ""

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