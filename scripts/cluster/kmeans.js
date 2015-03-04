var fs = require("fs");
var MongoClient = require("mongodb");
var stopwords = require("stopwords").english;
var clusterfck = require("clusterfck");

var dbPath = "mongodb://localhost/exciting";
MongoClient.connect(dbPath, function(err, db) {
  var extractionCollection = db.collection("re_sentence_extractions");
  var clusterCollection = db.collection("clusters2");
  
  extractions_cursor = extractionCollection.aggregate([{"$group" : {"_id" : {"cited_paper" : "$cited_paper"}, "extractions" : {"$push" : "$extraction"}}} ], { cursor: { batchSize: 1 }});

  // clusterCollection.drop();
  extractions_cursor.each(function(error, doc) {
    if(doc == null) {
      db.close();
    }
    else {
      var dictionary = [];
      populateDictionary(doc.extractions, dictionary);
      var vectors = [];
      var vectorToString = {};
      if (!err && doc.extractions.length > 0) {  // must have extractions associated with the paper
        doc.extractions.forEach(function(extraction) {
          var vector = [];
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
        var k = 2;
        var clusters = clusterfck.kmeans(vectors, k);
        var cluster_doc = {"cited_paper": doc['_id']['cited_paper']};
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
    }
  });
});

function populateDictionary(extractions, dictionary) {
  extractions.forEach(function(extraction) {
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
