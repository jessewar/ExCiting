var fs = require("fs");
var MongoClient = require("mongodb");
var stopwords = require("stopwords").english;
var NGrams = require("natural").NGrams;
var ngram_totals = require("./ngram-totals");
var math = require("mathjs");
var Server = require("mongo-sync").Server;

var server = new Server("localhost");
var extractionCollection = server.db("mongodata").getCollection("re_sentence_extractions");
var total_extractions = extractionCollection.count();
var papers_above_threshold = fs.readFileSync("./papers_above_threshold.txt", "utf8").split("\n");
papers_above_threshold.forEach(function(paper_id) {
  var result = {cited_paper: paper_id,
                bigrams: []};
  var bigram_counts = {};
  var extraction_docs = extractionCollection.find({cited_paper:paper_id}).toArray();
  extraction_docs.forEach(function(extraction_doc) {
    if (extraction_doc.extraction !== undefined) {
      var extraction = extraction_doc.extraction.toLowerCase();
      var bigrams = NGrams.ngrams(extraction, 2);
      // populate bigram counts for current paper
      bigrams.forEach(function(bigram) {
        if (!bigram_counts[bigram]) {
          bigram_counts[bigram] = 1;
        } else {
          bigram_counts[bigram] = bigram_counts[bigram] + 1;
        }
      });
    }
  });
  // calculate tf-idf
  for (var bigram in bigram_counts) {
    var tf = bigram_counts[bigram];
    var idf = math.log((total_extractions / ngram_totals[bigram]), 10);
    result.bigrams.push({bigram: bigram, tfidf: tf * idf, tf: tf, idf: idf});
  }
  printResult(result);
});

function printResult(result) {
  var bigrams = result.bigrams;
  bigrams.sort(function(bigram1, bigram2) {
    return bigram2.tfidf - bigram1.tfidf;
  });
  for (var i = 0; i < 3; i++) {
    console.log(bigrams[i]);
  }
  console.log("--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------");
}

// var ngram_counts = {};
// var n = 3;
// var dbPath = "mongodb://localhost/mongodata";
// MongoClient.connect(dbPath, function(err, db) {
//   var extractionCollection = db.collection("re_sentence_extractions");
//   extractionCollection.find({cited_paper:"A92-1021"}).toArray(function(err, result) {
//     result.forEach(function(extraction_doc) {
//       var extraction = extraction_doc.extraction.toLowerCase();
//       var ngrams = NGrams.ngrams(extraction, n);
//       ngrams.forEach(function(ngram) {
//         if (!ngram_counts[ngram]) {
//           ngram_counts[ngram] = 1;
//         } else {
//           ngram_counts[ngram] = ngram_counts[ngram] + 1;
//         }
//       });
//     });

//     var threshold = 3;
//     for (var ngram in ngram_counts) {
//       if (ngram_counts[ngram] >= threshold) {
//         console.log(ngram + " " + ngram_counts[ngram]);
//       }
//     }
//     db.close();
//   });
// });
