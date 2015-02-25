var MongoClient = require("mongodb");
var stopwords = require("stopwords").english;
var NGrams = require("natural").NGrams;
var ngram_counts = require("./ngram-counts");

var total_num_extractions = 5607; // TODO: make this use a count() query on the extractions collection
console.log(ngram_counts);



var ngram_counts = {};
var n = 3;
var dbPath = "mongodb://localhost/mongodata";
MongoClient.connect(dbPath, function(err, db) {
  var extractionCollection = db.collection("re_sentence_extractions");
  extractionCollection.find({cited_paper:"A92-1021"}).toArray(function(err, result) {
    result.forEach(function(extraction_doc) {
      var extraction = extraction_doc.extraction.toLowerCase();
      var ngrams = NGrams.ngrams(extraction, n);
      ngrams.forEach(function(ngram) {
        if (!ngram_counts[ngram]) {
          ngram_counts[ngram] = 1;
        } else {
          ngram_counts[ngram] = ngram_counts[ngram] + 1;
        }
      });
    });

    var threshold = 3;
    for (var ngram in ngram_counts) {
      if (ngram_counts[ngram] >= threshold) {
        console.log(ngram + " " + ngram_counts[ngram]);
      }
    }
    db.close();
  });
});
