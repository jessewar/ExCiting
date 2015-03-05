var fs = require("fs");
var stopwords = require("stopwords").english;
stopwords.push.apply(stopwords, ['1', '2', '3', '4', '5', '6', '7', '8', '9']);
var Server = require("mongo-sync").Server;

var db = new Server("localhost").db("exciting");
var extraction_collection =  db.getCollection("re_sentence_extractions");
var filtered_extraction_collection = db.getCollection("filtered_extractions");
var extraction_docs = extraction_collection.find().toArray();
extraction_docs.forEach(function(extraction_doc) {
  var extraction_words = extraction_doc.extraction.split(" ");
  var i = 0;
  while (i < extraction_words.length) {
    var word = extraction_words[i].toLowerCase();
    if (stopwords.indexOf(word) >= 0) {
      extraction_words.splice(i, 1);
    } else {
      i++;
    }
  }
  var new_extraction = extraction_words.join(" ");
  extraction_doc.extraction = new_extraction;
  filtered_extraction_collection.insert(extraction_doc);
});
