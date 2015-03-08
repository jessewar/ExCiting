var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* GET email-reponse */
router.get('/email-response/', function(req, res, next) {
  var paper_id = req.query.paper;
  var db = req.db;

  // TODO: Need better error checking than this
  if(!paper_id) {
    var err = new Error('Invalid Parameters');
    err.status = 500;
    next(err);
  }
  else {
    getContentsForPaper(db, paper_id, function(paper_contents){
      console.log(paper_contents);

      if(!paper_contents.aggregate) {
        var err = new Error('Paper not found');
        err.status = 500;
        next(err);
      }
      else {
        // Shuffle paper summaries
        paper_contents.aggregate.summaries = shuffleArray(paper_contents.aggregate.summaries);

        res.render('email-response-form', 
          {
            title : 'Summarization Evaluation',
            paper_name : paper_contents.paper.title,
            summaries  : paper_contents.aggregate.summaries,
            paper_id : paper_id
          });
      }
    });
  }

  function getContentsForPaper(db, paper_id, viewRenderFn){
    paper_collection = db.get('papers');

    paper_collection.find({"paper_id" : paper_id}, {}, function(err, docs) {
      paper_info = docs[0];
      
      aggregation_collection = db.get('aggregated_results');
      aggregation_collection.find({"paper_id" : paper_id}, {}, function(err, docs) {
        aggregated_info = docs[0];

        contents = {'paper' : paper_info, 'aggregate' : aggregated_info};
        viewRenderFn(contents);
      });
    });
  }
});

router.post('/email-response/', function(req, res, next) {
  var paper_id = req.body.paper_id;
  var db = req.db;

  console.log(req.body);

  // TODO: Need better error checking than this
  if(!paper_id) {
    var err = new Error('Invalid Parameters');
    err.status = 500;
    next(err);
  }
  else {
    // Clean body
    req.body.precision = parseInt(req.body.precision)
    req.body.recall = parseInt(req.body.recall)
    db.get('evaluation_responses').insert(req.body, function(err, docs) {
       if (err) {
        next(err)  
       }
      
       res.render('email-response-received', {title : 'Response Received'});
    });
  } 
});

module.exports = router;


/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}