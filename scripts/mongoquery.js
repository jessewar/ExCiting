// Usage: cat filename | mongo
use mongodata
db.re_sentence_extractions.aggregate([
  {"$group" : {
    "_id" : {
      "cited_paper" : "$cited_paper"
    },
    "extractions": {
      "$push" : "$extraction"
    },
    "num_extractions": {
      "$sum" : 1
    }
  }},
  {"$match" :{
    "num_extractions" : {
      "$gte" : 30
    }
  }}
])