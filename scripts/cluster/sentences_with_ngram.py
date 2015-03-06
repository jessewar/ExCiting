import re
import string
import sys
#haaaccky
sys.path.append('../')
sys.path.append('../extract/')
from common import *
import get_extractions


'''
returns list of sentences
'''
def sentences_containing_ngram(sentences, ngram):
  matched_sentences = []
  regexp = re.compile("[- :;.,]".join(ngram.split(",")))
  for sentence in sentences:
    if re.search(regexp, sentence):
      matched_sentences.append(sentence)

    # if ngram_substring in sentence.lower():
      # matched_sentences.append(sentence)
  return matched_sentences
  

def main():
  collection = db.ngrams
  cursor = collection.find()

  papers_and_extractions = get_extractions.above_threshold(1, 're_sentence_extractions')

  results = []
  for paper_id in papers_and_extractions:
    paper_doc = collection.find_one({'cited_paper' : paper_id})
    ngrams_and_sentences = []
    for ngram in paper_doc[u'bigrams']:
      ngram_mapping = {}
      ngram_mapping['ngram'] = ngram[u'ngram']
      ngram_mapping['tfidf'] = ngram[u'tfidf']
      ngram_mapping['matching_sentences'] = sentences_containing_ngram(papers_and_extractions[paper_id], ngram[u'ngram'])
      ngram_mapping['n'] = 2
      ngrams_and_sentences.append(ngram_mapping)

    for ngram in paper_doc[u'trigrams']:
      ngram_mapping = {}
      ngram_mapping['ngram'] = ngram[u'ngram']
      ngram_mapping['tfidf'] = ngram[u'tfidf']
      ngram_mapping['matching_sentences'] = sentences_containing_ngram(papers_and_extractions[paper_id], ngram[u'ngram'])
      ngram_mapping['n'] = 3
      ngrams_and_sentences.append(ngram_mapping)

    results.append({'cited_paper' : paper_id, 'ngrams' : ngrams_and_sentences})


  pp.pprint(results)

  return None

if __name__ == '__main__':
  main()