var fs = require("fs");
var stopwords = require("stopwords").english;
var NGrams = require("natural").NGrams;
var ngram_totals = require("./ngram-totals");
var math = require("mathjs");
var Server = require("mongo-sync").Server;

var db = new Server("localhost").db("exciting");
var extraction_collection =  db.getCollection("re_sentence_extractions");
var ngram_collection = db.getCollection("ngrams2");
var total_extractions = extraction_collection.count();
var papers_above_threshold = fs.readFileSync("./papers_above_threshold.txt", "utf8").split("\n");
papers_above_threshold.forEach(function(paper_id) {
  var extraction_docs = extraction_collection.find({cited_paper:paper_id}).toArray();
  var bigram_counts = getNgramCountObject(extraction_docs, 2);
  var trigram_counts = getNgramCountObject(extraction_docs, 3);
  var fourgram_counts = getNgramCountObject(extraction_docs, 4);
  var fivegram_counts = getNgramCountObject(extraction_docs, 5);
  // calculate tf-idf
  var result = {cited_paper: paper_id,
                bigrams: getNgramData(bigram_counts),
                trigrams: getNgramData(trigram_counts),
                fourgrams: getNgramData(fourgram_counts),
		fivegrams: getNgramData(fivegram_counts)};
  ngram_collection.insert(result);
});

// returns an array of objects which contain ngrams and their tf-idf values
function getNgramData(ngram_counts) {
  var ngrams = [];
  for (var ngram in ngram_counts) {
    var tf = ngram_counts[ngram];
    var idf = math.log((total_extractions / ngram_totals[ngram]), 10);
    ngrams.push({ngram: ngram, tfidf: tf * idf, tf: tf, idf: idf});
  }
  ngrams.sort(function(ngram1, ngram2) {
    return ngram2.tfidf - ngram1.tfidf;
  });
  return ngrams.slice(0, 5);
}

// returns an object mapping the ngrams contained within a list of documents to their frequency within the documents
function getNgramCountObject(extraction_docs, n) {
  var ngram_counts = {};
  extraction_docs.forEach(function(extraction_doc) {
    if (extraction_doc.extraction !== undefined) {
      var extraction = extraction_doc.extraction.toLowerCase();
      var ngrams = NGrams.ngrams(extraction, n);
      ngrams.forEach(function(ngram) {
        if (numStopWords(ngram) <= n / 2) {  // filter out ngrams that are coposed mostly of stop words
          if (!ngram_counts[ngram]) {
            ngram_counts[ngram] = 1;
          } else {
            ngram_counts[ngram] = ngram_counts[ngram] + 1;
          }
        }
      });
    }
  });
  return ngram_counts;
}

// returns the number of stop words in an array
function numStopWords(ngram) {
  var numStopWords = 0;
  ngram.forEach(function(word) {
    if (stopwords.indexOf(word) >= 0) {
      numStopWords++;
    }
  });
  return numStopWords;
}

function printResult(result, ngrams) {
  var ngrams = result[ngrams];
  ngrams.sort(function(ngram1, ngram2) {
    return ngram2.tfidf - ngram1.tfidf;
  });
  for (var i = 0; i < 3; i++) {
    console.log(ngrams[i]);
  }
  console.log("--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------");
}
