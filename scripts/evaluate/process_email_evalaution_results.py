import pymongo
import csv
connection = pymongo.MongoClient("localhost", 27017)
db = connection.exciting

def main():
  eval_responses()
  sum_responses()


def sum_responses():
  cursor = db.summary_responses.find()
  

  rows = [('Paper', 'Summary Name', 'Precision', 'Recall')]
  for doc in cursor:
    paper = doc[u'paper_id']
    
    if u'abstract-summary' not in doc or u'longest-ngram-sentence' not in doc or u'naive-summary' not in doc or u'best-ngram-sentence' not in doc:
      continue
    if u'precision' not in doc[u'longest-ngram-sentence']:
      doc[u'longest-ngram-sentence'][u'precision'] = 0


    rows.append([paper, 'abstract-summary', doc[u'abstract-summary'][u'precision'], doc[u'abstract-summary'][u'recall']])
    rows.append([paper, 'naive-summary', doc[u'naive-summary'][u'precision'], doc[u'naive-summary'][u'recall']])
    rows.append([paper, 'longest-ngram-sentence', doc[u'longest-ngram-sentence'][u'precision'], doc[u'longest-ngram-sentence'][u'recall']])
    rows.append([paper, 'best-ngram-sentence', doc[u'best-ngram-sentence'][u'precision'], doc[u'best-ngram-sentence'][u'recall']])

  write_to_file(rows, 'sum_responses')

def eval_responses():
  eval_cursor = db.evaluation_responses.aggregate([
    {"$group" : {
      "_id" : {
        "paper" : "$paper_id",
        "best" : "$best-summary"
      },
      "votes" : {
        "$sum" : 1
      }
    }},
    {"$project" : {
      "_id" : 0,
      "paper" : "$_id.paper",
      "summary_name" : "$_id.best",
      "votes" : "$votes"
    }}
  ])

  rows = [('Paper', 'Summary Name', 'Votes')]
  for doc in eval_cursor['result']:
    row = (doc[u'paper'], doc[u'summary_name'], doc[u'votes'])
    rows.append(row)

  write_to_file(rows, 'eval_responses')

def write_to_file(results, filename):
  with open(filename + '.csv','w') as out:
    csv_out=csv.writer(out)
    for row in results:
      csv_out.writerow(row)


if __name__ == "__main__":
  main()