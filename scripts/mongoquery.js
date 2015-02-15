// Usage: cat filename | mongo
// Great extractions to be found here "N03-1033"
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
    "_id.cited_paper" : "N03-1033"
  }},
  {"$unwind" : "$extractions"}
//  {"$match" :{
//    "num_extractions" : {
//      "$gte" : 30
//    }
//  }}
])