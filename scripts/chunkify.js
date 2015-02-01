var parseString = require('xml2js').parseString;
var fs = require("fs");
var xpath = require("xpath.js");
var dom = require("xmldom").DOMParser;
fs.readFile("./test.xml", "utf8", function(err, data) {
  if (err) { console.log(err); }
  // var startString = "<citationList>";
  // var endString = "</citationList>";
  // var citations = data.substring(data.indexOf(startString), data.indexOf(endString) + endString.length);
  // parseString(citations, function(err, result) {
  //   if (err) { console.log(err); }
  //   console.log(JSON.stringify(result.citationList[0], undefined, 2));
  // });
  var xml = new dom().parseFromString(data);
  var nodes = xpath("//citation", xml);
  console.log(nodes[0]);
});
