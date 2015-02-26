var MongoClient = require("mongodb");
var stopwords = require("stopwords").english;
var NGrams = require("natural").NGrams;

var bigram_counts = {};
var n = 3;
var threshold = 3;
var dbPath = "mongodb://localhost/mongodata";
MongoClient.connect(dbPath, function(err, db) {
  var extractionCollection = db.collection("re_sentence_extractions");
  extractionCollection.find({cited_paper:"A92-1021"}).toArray(function(err, result) {
    result.forEach(function(extraction_doc) {
      var extraction = extraction_doc.extraction.toLowerCase();
      var bigrams = NGrams.ngrams(extraction, n);
      bigrams.forEach(function(bigram) {
        if (!bigram_counts[bigram]) {
          bigram_counts[bigram] = 1;
        } else {
          bigram_counts[bigram] = bigram_counts[bigram] + 1;
        }
      });
    });
    for (var bigram in bigram_counts) {
      if (bigram_counts[bigram] >= threshold) {
        var num_stopwords = 0;
        var words = bigram.split(",");
        words.forEach(function(word) {
          if (stopwords.indexOf(word) >= 0) {
            num_stopwords++;
          }
        });
        if (num_stopwords <= n / 2) {
          console.log(bigram + " " + bigram_counts[bigram]);
        }
      }
    }
  });
});
