var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

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
        
      req.dataProcessed = {
        chosen_summary : req.body["best-summary"],
        precision: req.body.precision,
        recall : req.body.recall,
        paper_id : req.body.paper_id
      };
      return secondFormCtrl(req, res, next);
      // res.render('email-response-received', {title : 'Response Received'});
    });
  } 
});

router.post('/summary-response/', function(req, res, next) {
  var paper_id = req.body.paper_id;
  var db = req.db;
  
  console.log(req.body);
  console.log(req.body.precision);
   if(!paper_id) {
    var err = new Error('Invalid Parameters');
    err.status = 500;
    next(err);
  }
  else {
    var insertable = {
      paper_id : req.body.paper_id
    };
    // Manually parse input because bodyparser not working as it should.
    for(key in req.body) {
      if (key.indexOf("precisions") != -1) {
        name = key.split("[")[1];
        name = name.substring(0, name.length - 1);
        if(!insertable.hasOwnProperty(name)) {
          insertable[name] = {};
        }
        insertable[name]['precision'] = parseInt(req.body[key]);
      }
      else if(key.indexOf("recalls") != -1) {
        name = key.split("[")[1];
        name = name.substring(0, name.length - 1);
        if(!insertable.hasOwnProperty(name)) {
          insertable[name] = {};
        }
        insertable[name]['recall'] = parseInt(req.body[key]);
      }
    }

    db.get('summary_responses').insert(insertable, function(err, docs) {
      if (err) {
        next(err)  
      }
        
      // return secondFormCtrl(req, res, next);
      res.render('email-response-received', {title : 'Response Received'});
    });
  } 


});


function secondFormCtrl(req, res, next) {  
  req.db.get('aggregated_results').find({"paper_id" : req.dataProcessed.paper_id}, {}, function(err, docs) {
    aggregated_info = docs[0];
    
    summaries = aggregated_info.summaries.filter(function(summary, ind) {
      return summary.name != req.dataProcessed.chosen_summary;
    });



    res.render('summary-response-form', {
      paper_id : req.dataProcessed.paper_id,
      summaries : shuffleArray(summaries),
      hidden_summary : {
        name : req.dataProcessed.chosen_summary,
        precision :req.dataProcessed.precision,
        recall : req.dataProcessed.recall
      }
    });
    // return next();
  });
}

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