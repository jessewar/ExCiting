var MongoClient = require("mongodb");
var NGrams = require("natural").NGrams;
var fs = require("fs");
var Server = require("mongo-sync").Server;
var server = new Server('127.0.0.1');

var min_ngram_size = 1;
var max_ngram_size = 5;
var ngram_totals = {};
//var extractionCollection = server.db("exciting").getCollection("filtered_extractions");
var extractionCollection = server.db("exciting").getCollection("re_sentence_extractions");
var extraction_docs = extractionCollection.find().toArray();
var num_extractions = extractionCollection.count();
extraction_docs.forEach(function(extraction_doc) {
  var extraction = extraction_doc.extraction.toLowerCase();
  for (var n = min_ngram_size; n <= max_ngram_size; n++) {
    var ngrams = NGrams.ngrams(extraction, n);
    ngrams.forEach(function(ngram) {
      if (!ngram_totals[ngram]) {
        ngram_totals[ngram] = 1;
      } else {
        ngram_totals[ngram] = ngram_totals[ngram] + 1;
      }
    });
  }
});

module.exports = exports = ngram_totals;
