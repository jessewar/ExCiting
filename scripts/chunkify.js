var fs = require("fs");
var xpath = require("xpath");
var dom = require("xmldom").DOMParser;
//var MongoClient = require("mongodb");

// var files = fs.readdirSync(process.argv[2]);  // command line argument is path to directory
// files.forEach(function(file) {
//   var filename = file.substring(0,file.indexOf("."));
//   var filecontents = fs.readFileSync(file, "utf8");
//   var xml = new dom().parseFromString(filecontents);
//   var title = xpath.select("//title[@confidence][not(./@confidence < //title/@confidence)][1]/text()", xml);
//   console.log(title);
//   var citations = xpath.select("//citation", xml);
//   for (var i = 0; i < citations.length; i++) {
//     console.log(citations[i].toString());
//   }
// });

var file = "A00-1021.xml";
var filecontents = fs.readFileSync(file, "utf8");
var xml = new dom().parseFromString(filecontents);

// get paper related data
var filename = file.substring(0, file.indexOf("."));
var title = xpath.select("//title[@confidence][not(./@confidence < //title/@confidence)][1]/text()", xml).toString();
console.log(title);

// get chunk related data
var citer_paper = filename;
var citations = xpath.select("//citation", xml);
for (var i = 0; i < citations.length; i++) {
  var cited_paper_title = xpath.select("title/text()[1]", citations[i]).toString();
  var text = xpath.select("contexts/context[1]/text()", citations[i]).toString();  // we only use the first reference to this paper if it is cited multiple time
  var citation_text = xpath.select("contexts/context[1]/@citStr", citations[i]).toString();
  console.log(cited_paper_title);
  if (text.length > 0) {  // only do stuff if there is a reference to this paper within the text

    // console.log(text);
    // console.log(citation_text);
    // console.log();
  }
  // get cited_paper id from cited_paper_title. Throw away paper if not within corpus

}




// // compose documents
// var paper = {'_id' : filename,
//        'title' : title};

// // insert into collections
// var paperCollection = db.collection("paper");
// var chunkCollection = db.collection("chunk");
// paperCollection.insert(paper, function(err, result) {});


// var dbPath = "mongodb://localhost/test";
// MongoClient.connect(dbPath, function(err, db) {
