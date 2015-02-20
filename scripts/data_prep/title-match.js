var fs = require("fs");
var xpath = require("xpath");
var dom = require("xmldom").DOMParser;

// Build map of paper_title -> paper_id
var map = {};
var paper_ids = fs.readFileSync("paper_ids.txt", "utf8").split("\n");
for (var i = 0; i < paper_ids.length; i++) {
  var tokens = paper_ids[i].split("\t");
  var id = tokens[0];
  var title = tokens[1];
  if (title != undefined && id != undefined) {
    map[title.toLowerCase()] = id;
  }
}

// Build list of most heavily cited papers
var papers = fs.readFileSync("../../papers_above_threshold.txt", "utf8").split("\n");
var parsed_papers = fs.readdirSync("/home/jesse/Classes/CSE454/ExCiting/data/paper_subset/chunks");
var counts = {};  // map of paper id to number of times it was referenced from papers within papers_above_threshold using current title matching algorithm
for (var i = 0; i < 20; i++) {
  var paper = papers[i];
  var match = 0;
  parsed_papers.forEach(function(parsed_paper) {
    try {
      var parsed_paper_contents = fs.readFileSync("./" + parsed_paper, "utf8");
      var xml = new dom().parseFromString(parsed_paper_contents);
      if (xml != undefined) {
        var citations = xpath.select("//citation", xml);
        if (citations != undefined) {
          for (var i = 0; i < citations.length; i++) {
            var title = xpath.select("title/text()[1]", citations[i]).toString();
            if (title != undefined) {
              title = title.substring(0, title.length-1).toLowerCase();  // take off period and do case insensitive comparison
              if (map[title] != undefined) {
                var target_id = paper;
                if (map[title].localeCompare(target_id) === 0) {
                  match++;
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  });
  counts[paper] = match;
}

for (var key in counts) {
  console.log(key + " " + counts[key]);
}
