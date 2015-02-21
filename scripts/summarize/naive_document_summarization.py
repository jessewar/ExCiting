import sys
#haaaccky
sys.path.append('../extract/')

import frequency_summarizer
import get_extractions
import pprint
# from nltk.tokenize import sent_tokenize


'''
Performs summarization by concatenating all of the the extractions
together into a single document. It then pulls out the sentences that contain
the words with the highest frequencies in the document and uses those as the 
summaries. It outputs 3 summaries per document.
'''
def main():
  summarizer = frequency_summarizer.FrequencySummarizer()
  extractions = get_extractions.above_threshold(25, 're_sentence_extractions')


  papers_and_summaries = {}

  for paper_id in extractions:
    document = ".".join(extractions[paper_id])   
    summaries = summarizer.summarize(document, 3)
    papers_and_summaries[paper_id] = summaries


  pp = pprint.PrettyPrinter(indent=2)
  pp.pprint(papers_and_summaries)

if __name__ == '__main__':
  main()