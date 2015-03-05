import pymongo
import aan_importer
import re



'''
Builds the mongo papers collection
'''
def main():

  # connect to mongod instance
  client = pymongo.MongoClient()
  # get database
  db = client.exciting
  # get collection
  collection = db.papers

  # import data from aan (CHANGE THIS LINE IF NEEDED)
  import_path = '../../data/repo-exclude/aan/release/2013/'
  import_papers(collection, import_path)
  # citing_papers = db.citing_papers
  # import_papers(citing_papers, import_path, citing_papers_subset())
  # 
  
  # cursor = collection.find()
  # result = []
  # for doc in cursor:
  #   doc[u'abstract'] = cleaned_abstract(doc[u'abstract'])
  #   result.append(doc)


  # collection.drop()
  # collection.insert(result)



def import_papers(mongo_collection, aan_import_path):
  # Clear collection
  mongo_collection.drop()

  uw_papers = papers_set('../../data/uw_papers.txt')

  paper_data = imported_aan_data(aan_import_path, full_papers_set())

  for paper_id in paper_data:
    paper = paper_data[paper_id]
    insertable = { 'paper_id' : paper_id, 'authors' : paper['authors'], 'year' : paper['year'], 'title' : paper['title'], 'abstract' : paper['abstract'] }

    insertable['uw_paper?'] = True if paper_id in uw_papers else False
    mongo_collection.insert(insertable)


'''
Returns mapping of the form:
{<paper_id> : {'title' : <title>, 'year' : <year>, 'authors' : [<author_name>, ...] }, ... }
'''
def imported_aan_data(path_to_aan_release_year, paper_set):
  importer = aan_importer.aan_importer(path_to_aan_release_year)
  papers = importer.paper_ids_to_identifiers(paper_set)
  papers_and_authors = importer.papers_to_authors()
  authorids_and_names = importer.author_id_to_names()


  mappings = {}
  for paper_id in papers:
    mappings[paper_id] = {'title' : papers[paper_id]['title'], 'year' : papers[paper_id]['year']}
    mappings[paper_id]['authors'] = []
    fulltext = importer.fulltext_for_paper_id(paper_id)
    mappings[paper_id]['abstract'] = get_abstract(fulltext)
    if paper_id in papers_and_authors:
      author_ids = papers_and_authors[paper_id]
      
      author_names = []
      for author_id in author_ids:
        author_names.append(authorids_and_names[author_id])
      mappings[paper_id]['authors'] = author_names
  return mappings

def papers_set(filepath):
  papers = []
  with open(filepath, 'r') as f:
    for line in f:
      papers.append(line.rstrip())
  return papers

def full_papers_set():
  papers = papers_set('../../data/papers_above_threshold.txt')
  papers = papers + papers_set('../../data/uw_papers.txt')
  papers = papers + papers_set('../../data/papers_citing_threshold_papers.txt')
  papers = papers + papers_set('../../data/papers_citing_uw_papers.txt')
  return papers

'''
Returns the abstract for this paper.
Note: this function currently extracts for ~80% of the papers in our dataset
A number of the papers in that remaining 20% (estimate to be 50-75%) do not have abstracts
The remaining ones are falling through because this one is too simple
'''
def get_abstract(fulltext):
  
  abstract = ""
  
  intro_match = re.search(r"1?\.?\ *(i\ *n\ *t\ *r\ *o\ *d\ *u\ *c|m\ *o\ *t\ *i\ *v\ *a)\ *t\ *i\ *o\ *n", fulltext, re.IGNORECASE)
    
  if intro_match:
    fulltext = fulltext[:intro_match.start()]
    abstract_match = re.search(r"a\ *b\ *s\ *t\ *r\ *a\ *c\ *t", fulltext, re.IGNORECASE)
    if abstract_match:
      abstract_match.end()
      abstract = fulltext[abstract_match.end():]
    else:
      # Try to match by the authors/universities block at beginning
      lastmatch = None
      for match in re.finditer(r"(university|college|institute).*\n", fulltext, re.IGNORECASE):
        lastmatch = match

      if lastmatch is not None:
        abstract = fulltext[lastmatch.end():]

  return cleaned_abstract(abstract)


def cleaned_abstract(abstract):
  abstract = abstract.replace("\n", " ")
  abstract = abstract.replace("- ", "")
  abstract = abstract.replace("  ", " ")
  
  return abstract.strip()

if __name__ == '__main__':
  main()