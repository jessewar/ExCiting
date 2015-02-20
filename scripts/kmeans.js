var fs = require("fs");
var MongoClient = require("mongodb");
var stopwords = require("stopwords").english;
var clusterfck = require("clusterfck");

var dbPath = "mongodb://localhost/exciting";
MongoClient.connect(dbPath, function(err, db) {
  var extractionCollection = db.collection("re_sentence_extractions");
  var clusterCollection = db.collection("clusters");
  var papers_above_threshold = fs.readFileSync("./papers_above_threshold.txt", "utf8").split("\n");
  papers_above_threshold.forEach(function(paper_id) {
    extractionCollection.find({cited_paper:paper_id}).toArray(function(err, documents) {
      var dictionary = [];
      populateDictionary(documents, dictionary);
      var vectors = [];
      var vectorToString = {};
      if (!err && documents.length > 0) {  // must have extractions associated with the paper
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
        var cluster_doc = {"cited_paper":paper_id};
        for (var i = 0; i < k; i++) {
          var cluster = clusters[i];
          var string_cluster = [];
          if (cluster != undefined) {
            cluster.forEach(function(vector) {
              string_cluster.push(vectorToString[vector]);
            });
            cluster_doc[i] = string_cluster;
          }
        }
        clusterCollection.insert(cluster_doc, function(err, result) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  });
});

function populateDictionary(documents, dictionary) {
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
