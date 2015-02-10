var fs = require("fs");
var xpath = require("xpath");
var dom = require("xmldom").DOMParser;

// Build map of paper_title -> paper_id
var map = {};
var papers = fs.readFileSync("paper_ids.txt", "utf8").split("\n");
for (var i = 0; i < papers.length; i++) {
  var tokens = papers[i].split("\t");
  var id = tokens[0];
  var title = tokens[1];
  map[title] = id;
}

// W04-1013

var files = fs.readdirSync("/home/jesse/Classes/CSE454/ExCiting/data/paper_subset/chunks");
var match = 0;
files.forEach(function(file) {
  var filecontents = fs.readFileSync("./paper-dir/output/" + file, "utf8");
  var xml = new dom().parseFromString(filecontents);
  if (xml != undefined) {
    var citations = xpath.select("//citation", xml);
    for (var i = 0; i < citations.length; i++) {
      var title = xpath.select("title/text()[1]", citations[i]).toString();
      title = title.substring(0, title.length-1);  // take off period
      if (map[title] != undefined && match[title] === "W04-1013") {
        match++;
        console.log("FOUND: " + map[title] + "source: " + file);
      }
    }
  }
});
console.log(match + " title matches out of " + count + " titles");
