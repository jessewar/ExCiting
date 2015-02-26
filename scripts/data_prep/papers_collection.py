import pymongo
import aan_importer


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
  paper_data = imported_aan_data('../../../aan/release/2013/')

  for paper_id in paper_data:
    paper = paper_data[paper_id]
    insertable = { 'paper_id' : paper_id, 'authors' : paper['authors'], 'year' : paper['year'], 'title' : paper['title'] }
    collection.insert(insertable)

'''
Returns mapping of the form:
{<paper_id> : {'title' : <title>, 'year' : <year>, 'authors' : [<author_name>, ...] }, ... }
'''
def imported_aan_data(path_to_aan_release_year):
  importer = aan_importer.aan_importer(path_to_aan_release_year)
  papers = importer.paper_ids_to_identifiers()
  papers_and_authors = importer.papers_to_authors()
  authorids_and_names = importer.author_id_to_names()


  mappings = {}
  for paper_id in papers:
    mappings[paper_id] = {'title' : papers[paper_id]['title'], 'year' : papers[paper_id]['year']}
    mappings[paper_id]['authors'] = []
    if paper_id in papers_and_authors:
      author_ids = papers_and_authors[paper_id]
      
      author_names = []
      for author_id in author_ids:
        author_names.append(authorids_and_names[author_id])
      mappings[paper_id]['authors'] = author_names

    

  return mappings

if __name__ == '__main__':
  main()