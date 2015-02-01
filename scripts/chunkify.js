var fs = require("fs");
var xpath = require("xpath");
var dom = require("xmldom").DOMParser;
fs.readFile("./test.xml", "utf8", function(err, data) {
  if (err) { console.log(err); }
  var xml = new dom().parseFromString(data);
  var nodes = xpath.select("//citation", xml);
  for (var i = 0; i < nodes.length; i++) {
    console.log(nodes[i].toString());
  }
});
