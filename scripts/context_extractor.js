var fs = require("fs");
var xpath = require("xpath");
var dom = require("xmldom").DOMParser;

files = fs.readdirSync(process.argv[2]);
files.forEach(function(file) {

	var filecontents = fs.readFileSync(file, "utf8");
	var xml = new dom().parseFromString(filecontents);
	var citations = xpath.select("//citation", xml);

	for (var i = 0; i < citations.length; i++) {
	    var text = xpath.select("contexts/context[1]/text()", citations[i]).toString();
	    var citation_text = xpath.select("contexts/context[1]/@citStr", citations[i]).toString();

	    var citationTextRE = /citStr="(.*)"/;
	    var match = citation_text.match(citationTextRE);

	    if (match !== null) {
	      citeEndRE = null;
	      try {
	        citeEndRE = new RegExp("\\. ([^\\(\\)\\.]*)\\(" + match[1].trim() + "\\)\\.");
	      } catch (err) {
	        // console.log('invalid citation_text', citation_text);
	        continue;
	      }

	      if (text.length > 0 && citeEndRE.test(text)) { 
	        console.log("extracted sentence:", citeEndRE.exec(text)[1]);
	      }
	    }
  	}	
});