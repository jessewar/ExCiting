var MongoClient = require("mongodb");
var stopwords = require("stopwords").english;
var clusterfck = require("clusterfck");

var dictionary = [];
var vectors = [];
var vectorToString = {};
var dbPath = "mongodb://localhost/mongodata";
MongoClient.connect(dbPath, function(err, db) {
  var extractionCollection = db.collection("re_sentence_extractions");
  var clusterCollection = db.collection("clusters");


  extractionCollection.find({cited_paper:"W96-0213"}).toArray(function(err, documents) {
    if (!err) {
      populateDictionary(documents);
      documents.forEach(function(extraction_doc) {
        var vector = [];
        var extraction = extraction_doc.extraction;
        var extraction_words = extraction.toLowerCase().split(" ");
        dictionary.forEach(function(dictionary_word) {
          if (extraction_words.indexOf(dictionary_word) >= 0) {
            vector.push(1);
          } else {
            vector.push(0);
          }
        });
        vectors.push(vector);
        vectorToString[vector] = extraction;
      });

      // group vectors into k clusters
      var k = 3;
      var clusters = clusterfck.kmeans(vectors, k);
      var cluster_doc = {};
      for (var i = 0; i < k; i++) {
        var cluster = clusters[i];
        var string_cluster = [];
        cluster.forEach(function(vector) {
          console.log(vectorToString[vector]);
          string_cluster.push(vectorToString[vector]);
        });
        cluster_doc[i] = string_cluster;
      }
      clusterCollection.insert(cluster_doc, function(err, result) {
        if (err) {
	  console.log(err);
	}
        db.close();
      });
    }
  });
});

function populateDictionary(documents) {
  documents.forEach(function(extraction_doc) {
    var extraction = extraction_doc.extraction;
    var words = extraction.split(" ");
    words.forEach(function(word) {
      word = word.toLowerCase();
      if (stopwords.indexOf(word) < 0 && dictionary.indexOf(word) < 0) {
        dictionary.push(word);
      }
    });
  });
  dictionary.sort();
}
