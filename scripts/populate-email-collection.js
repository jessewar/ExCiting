var fs = require("fs");
var Server = require("mongo-sync").Server;
var server = new Server("localhost");
var db = server.db("exciting");

var title_to_id = {};
var paper_id_subset = fs.readFileSync("papers_above_threshold.txt", "utf8").split("\n");
var paper_id_and_title = fs.readFileSync("paper_ids.txt", "utf8").split("\n");
for (var i = 0; i < paper_id_and_title.length; i++) {
  var tokens = paper_id_and_title[i].split("\t");
  var id = tokens[0];
  var title = tokens[1];
  if (title != undefined && id != undefined && paper_id_subset.indexOf(id) > -1) {
    title_to_id[title.toLowerCase()] = id;
  }
}

var aggregated_results = db.getCollection("aggregated_results").find().toArray();
var valid_paper_ids = [];
aggregated_results.forEach(function(aggregated_result) {
  valid_paper_ids.push(aggregated_result.paper_id);
});

//email -> email, name, [papers]
var data = {};
var email_collection = db.getCollection("emails");
var email_chunks = fs.readFileSync("./auth.txt", "utf8").split("\n\n");
email_chunks.forEach(function(email_chunk) {
  var tokens = email_chunk.split("\n");
  var title = tokens[0].substring(1, tokens[0].length - 1);
  var paper_id = title_to_id[title.toLowerCase()];
  if (paper_id !== undefined && valid_paper_ids.indexOf(paper_id) >= 0) {
    for (var i = 1; i < tokens.length; i++) {
      if (tokens[i].length > 0) {
        var line = tokens[i].split("\t");
        var name = line[0].trim();
        var email = line[1].trim();
        if (data[email] === undefined) {
          data[email] = {email: email, name: name, papers: [{id: paper_id, title: title}]};
        } else {
          data[email].papers.push({id: paper_id, title: title});
        }
      }
    }
  }
});

for (var email_key in data) {
  email_collection.insert(data[email_key]);
}

server.close();
