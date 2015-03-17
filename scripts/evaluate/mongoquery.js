use exciting
db.evaluation_responses.aggregate([
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