import nltk
from sklearn.feature_extraction import text as skl_text
from sklearn.cluster import KMeans
import sys
#haaaccky
sys.path.append('../')
sys.path.append('../extract/')
from common import *
import get_extractions
from scipy.sparse import coo_matrix, hstack


# Min number of extractions a document needs to be clustered
MIN_EXTRACTIONS = 20


def main():
  fixed_n_clusters(10)
  proportional_n_clusters(20)



'''
Cluster experiment where extractions are clustered based upon a ratio 
proportional to the number of extractions a document has. 

Will drop the output_collection before inserting its new results
'''
def proportional_n_clusters(num_extractions_per_cluster):
  print "proportional_n_clusters - begin"
  output_collection = 'clusters_prop_' + str(num_extractions_per_cluster)

  papers_to_extractions = get_extractions.above_threshold(MIN_EXTRACTIONS, 're_sentence_extractions')
  results = {}
  for paper_id in papers_to_extractions:
    extractions = remove_one_word_extractions(papers_to_extractions[paper_id])
    matrix = ngram_and_tfidf_matrix(extractions)
    num_clusters = int(len(extractions) / num_extractions_per_cluster)
    if num_clusters == 0:
      continue
    clustered = k_means_cluster(num_clusters, matrix)
    results[paper_id] = map_clusters_extractions(extractions, clustered)

  db[output_collection].drop()
  db[output_collection].insert(results)


  print "proportional_n_clusters - end"



'''
Cluster experiment where extractions are clustered based upon a pre-determined,
fixed amount of clusters.

Will drop the output_collection before inserting its new results
'''
def fixed_n_clusters(num_clusters):
  print "fixed_n_clusters - begin"
  papers_to_extractions = get_extractions.above_threshold(MIN_EXTRACTIONS, 're_sentence_extractions')
  output_collection = 'clusters_fixed_' + str(num_clusters)
  results = {}
  for paper_id in papers_to_extractions:
    extractions = remove_one_word_extractions(papers_to_extractions[paper_id])
    matrix = ngram_and_tfidf_matrix(extractions)
    clustered = k_means_cluster(num_clusters, matrix)
    results[paper_id] = map_clusters_extractions(extractions, clustered)

  db[output_collection].drop()
  db[output_collection].insert(results)
  print "fixed_n_clusters - complete"
    

def map_clusters_extractions(extractions, clustered_extractions):
  # This function assumes that extractions and clustered_extractions have the same ordering
  assert len(extractions) == len(clustered_extractions), "Must be equal length"

  mappings = {}
  for index in xrange(len(clustered_extractions)):
    cluster = str(clustered_extractions[index])
    if cluster not in mappings:
      mappings[cluster] = []

    mappings[cluster].append(extractions[index])

  return mappings

def k_means_cluster(n_clusters, datapoints):
  clusterer = KMeans(n_clusters = n_clusters)
  return clusterer.fit_predict(datapoints)

def ngram_and_tfidf_matrix(paper_extractions):
  # paper_extractions = get_extractions.for_paper(paper_id)
  ngrams_matrix = skl_text.CountVectorizer().fit_transform(paper_extractions)
  tfidf_matrix = skl_text.TfidfTransformer().fit_transform(ngrams_matrix)
  return hstack([ngrams_matrix, tfidf_matrix])

def remove_one_word_extractions(extractions):
  return [x.strip() for x in extractions if len(x.strip().split(" ")) > 1 ]


if __name__ == "__main__":
  main()
