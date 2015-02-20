import frequency_summarizer
import extraction_analysis
import pprint
# from nltk.tokenize import sent_tokenize

def main():
  summarizer = frequency_summarizer.FrequencySummarizer()
  extractions = extraction_analysis.get_extractions_above_threshold(25)


  papers_and_summaries = {}

  for paper_id in extractions:
    document = ".".join(extractions[paper_id])   
    summaries = summarizer.summarize(document, 3)
    papers_and_summaries[paper_id] = summaries


  pp = pprint.PrettyPrinter(indent=2)
  pp.pprint(papers_and_summaries)


  # print document
  # print sent_tokenize(document)
  # print 



if __name__ == '__main__':
  main()