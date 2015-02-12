var fs = require("fs");
var xpath = require("xpath");
var dom = require("xmldom").DOMParser;
var MongoClient = require("mongodb");

// Build map of paper_title -> paper_id
var title_to_id = {};
populateTitleToIdMap();

var dbPath = "mongodb://localhost/test";
MongoClient.connect(dbPath, function(err, db) {
  var chunkCollection = db.collection("chunk");

  // form xml
  var parsed_paper = "Q13-1028.xml";
  var parsed_paper_contents = fs.readFileSync(parsed_paper, "utf8");
  var xml = new dom().parseFromString(parsed_paper_contents);

  // get paper related data
  var paper_id = parsed_paper.substring(0, parsed_paper.indexOf("."));
  var paper_title = xpath.select("//title[@confidence][not(./@confidence < //title/@confidence)][1]/text()", xml).toString();

  // get chunk related data
  var citer_paper_id = paper_id;
  var citations = xpath.select("//citation", xml);
  for (var i = 0; i < citations.length; i++) {
    var cited_paper_id = getPaperId(xpath.select("title/text()[1]", citations[i]).toString());
    var chunk_text = xpath.select("contexts/context[1]/text()", citations[i]).toString();  // we only use the first reference to this paper if it is cited multiple time
    var citation_text = xpath.select("contexts/context[1]/@citStr", citations[i]).toString().split('"')[1];
    if (cited_paper_id != undefined && chunk_text != undefined) {  // paper must be within corpus and be cited in a valid chunk
      var chunk = {"citer_paper" : citer_paper_id,
                   "cited_paper" : cited_paper_id,
                   "text" : chunk_text,
                   "citation_text" : citation_text};
      chunkCollection.insert(chunk, function(err, result) {
        if (err) { console.log(err); }
      });
    }
  }
  db.close();
});

function populateTitleToIdMap() {
  var paper_ids = fs.readFileSync("paper_ids.txt", "utf8").split("\n");
  for (var i = 0; i < paper_ids.length; i++) {
    var tokens = paper_ids[i].split("\t");
    var id = tokens[0];
    var title = tokens[1];
    if (title != undefined && id != undefined) {
      title_to_id[title.toLowerCase()] = id;
    }
  }
}

function getPaperId(paper_title) {
  var modified_title = paper_title.substring(0, paper_title.length-1).toLowerCase();  // take off period and do case insensitive comparison
  return title_to_id[modified_title];
}



// MongoDB stuff

// // compose documents
// var paper = {'_id' : filename,
//        'title' : paper_title};

// // insert into collections
// var paperCollection = db.collection("paper");
// var chunkCollection = db.collection("chunk");
// paperCollection.insert(paper, function(err, result) {});


// var dbPath = "mongodb://localhost/test";
// MongoClient.connect(dbPath, function(err, db) {
