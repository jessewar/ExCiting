// Takes ParsCit output (XML files), extracts the individual chunks
// and populates the DB with them

var fs = require('fs');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;
var MongoClient = require('mongodb');
var path = require('path');

// file containing the paper IDs of the papers we performed extractions on
var paperIDs = '../../data/uw_papers.txt';

// file containing a mapping from paper ID to paper title for the papers in
// our corpus and the associated delimeter
var paperIDsToTitles = '/Users/trevor/School/454/aan/release/2013/paper_ids.txt';
var paperTitleDelimiter = '\t';

// Build map of paper_title -> paper_id
var titleToID = {};
populateTitleToIdMap(paperIDs, paperIDsToTitles, paperTitleDelimiter);

// Directory of chunks
var chunkDir = '/Users/trevor/School/454/ExCiting/data/uw_paper_subset/chunks';

// MongoDB db path, and collection to store chunks in
var dbPath = 'mongodb://localhost/exciting';
var chunkColName = 'uw_chunks';

MongoClient.connect(dbPath, function(err, db) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  var chunkCol = getOrCreateCollection(db, chunkColName);
  if (chunkCol === undefined) {
    console.error('could not find or create collection', chunkColName);
    process.exit(1);
  }

  chunks = [];

  var parsedPaperDir = fs.readdirSync(chunkDir);
  parsedPaperDir.forEach(function(parsedPaper) {
    // form xml
    console.log('parsing', parsedPaper);
    var parsedPaperContents = fs.readFileSync(path.join(chunkDir, parsedPaper), 'utf8');
    var xml = new dom().parseFromString(parsedPaperContents);
    if (xml !== undefined) {
      // get paper related data
      var citerPaperId = parsedPaper.substring(0, parsedPaper.indexOf('.'));
      var paperTitle = xpath.select('//title[@confidence][not(./@confidence < //title/@confidence)][1]/text()', xml).toString();

      // get chunk related data
      var citations = xpath.select('//citation', xml);
      for (var i = 0; i < citations.length; i++) {
      	var citedPaperID = getPaperId(xpath.select('title/text()[1]', citations[i]).toString());

        // we only use the first reference to this paper if it is cited multiple time
      	var chunkText = xpath.select('contexts/context[1]/text()', citations[i]).toString();
      	var citationText = xpath.select('contexts/context[1]/@citStr', citations[i]).toString().split('"')[1];

        // paper must be within corpus and be cited in a valid chunk
      	if (citedPaperID !== undefined && 
            chunkText !== undefined && 
            chunkText.length !== 0 &&
            citationText.length !== 0) {
          chunks.push({'citer_paper' : citerPaperId,
                       'cited_paper' : citedPaperID,
                       'text' : chunkText,
                       'citation_text' : citationText});
        }
      }
    }
  });

  var inserted = 0;

  // someday we can do this as a bulk insert
  chunks.forEach(function(chunk) {
    chunkCol.insert(chunk, {w:1}, function(err, res) {
      if (!err) {
        inserted += 1;
      }
    });
  });

  console.log('inserted', inserted , 'chunks into', chunkColName);
  db.close();
});

// Populate the mapping from paperID to the title from the specified
// input files and delimeter
function populateTitleToIdMap(paperIDFile, idToTitleFile, delimeter) {
  var paperIDSubset = fs.readFileSync(paperIDFile, 'utf8').split('\n');
  var paperIDAndTitle = fs.readFileSync(idToTitleFile, 'utf8').split('\n');
  for (var i = 0; i < paperIDAndTitle.length; i++) {
    var tokens = paperIDAndTitle[i].split(delimeter);
    var id = tokens[0];
    var title = tokens[1];
    if (title !== undefined && id !== undefined && paperIDSubset.indexOf(id) > -1) {
      titleToID[title.toLowerCase()] = id;
    }
  }
}

// retrieves the collection from the db specified by collection name, creating it
// if it does not already exist
function getOrCreateCollection(db, collectionName) {
  db.collection(collectionName, {strict:true}, function(err, col) {
      if (err) {
        db.createCollection(collectionName, {}, function(err, createdCol) {
          if (err) {
            return err;
          }
        });
      }
    });
  return db.collection(collectionName);
}

// Performs fuzzy matching to try and find a matching paper title
// and associated paper ID from an extracted title
function getPaperId(paperTitle) {
  // take off period and do case insensitive comparison
  var modifiedTitle = paperTitle.substring(0, paperTitle.length-1).toLowerCase();
  return titleToID[modifiedTitle];
}