var MongoClient = require("mongodb");
var NGrams = require("natural").NGrams;
var fs = require("fs");
var Server = require("mongo-sync").Server;
var server = new Server('127.0.0.1');

var extractionCollection = server.db("mongodata").getCollection("re_sentence_extractions");
var results = extractionCollection.find().toArray();
var count = extractionCollection.count();
console.log(count);

var max_ngram_size = 3;
var ngram_totals = {"a":"b"};
var dbPath = "mongodb://localhost/mongodata";
MongoClient.connect(dbPath, function(err, db) {
  var extractionCollection = db.collection("re_sentence_extractions");
  var count = extractionCollection.count();
  console.log(count);
  extractionCollection.find({}).toArray(function(err, result) {
    if (!err && result.length > 0) {
      result.forEach(function(extraction_doc) {
        var extraction = extraction_doc.extraction.toLowerCase();
        for (var n = 2; n <= max_ngram_size; n++) {
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
    }
  });
//  db.close();
})

//module.exports = exports = ngram_totals;

