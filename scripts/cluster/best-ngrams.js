var Server = require("mongo-sync").Server;
var db = new Server("localhost").db("exciting");

var cutoff = 10;
//var ngram_collection =  db.getCollection("ngrams");
var ngram_collection = db.getCollection("ngrams_filtered2");
//var best_ngrams_collection = db.getCollection("best_ngrams");
var best_ngrams_collection = db.getCollection("best_ngrams_filtered");
var ngram_docs = ngram_collection.find().toArray();
var ngram_types = ["fivegrams", "fourgrams", "trigrams", "bigrams", "unigrams"];
ngram_docs.forEach(function(ngram_doc) {
  var best_ngram = undefined;
  for (var i = 0; i < ngram_types.length; i++) {
    var ngram_type = ngram_types[i];
    var curr_best_ngram = bestNgram(ngram_doc[ngram_type]);
    if (curr_best_ngram !== undefined) {
      best_ngram = curr_best_ngram;
      break;
    }
  }
  if (best_ngram === undefined && ngram_doc.unigrams[0] !== undefined) {
    best_ngram = ngram_doc.unigrams[0].ngram;
  }
  var result = {cited_paper: ngram_doc.cited_paper,
                ngram: best_ngram}
  best_ngrams_collection.insert(result);
});

function bestNgram(ngram_objects) {
  for (var i = 0; i < ngram_objects.length; i++) {
    var ngram_object = ngram_objects[i];
    if (ngram_object.tfidf > cutoff) {
      return ngram_object.ngram;
    }
  }
}
