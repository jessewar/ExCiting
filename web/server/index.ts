/// <reference path='./ts-definitions/node.d.ts' />
/// <reference path='./ts-definitions/express.d.ts' />

var express = require('express'),
  bodyParser = require('body-parser'),
  swig  = require('swig'),
  http = require('http'),
  errorhandler = require('errorhandler'),
  mongodb = require('mongodb');

// import session = require('express-session');
var STATIC_PATH : string = './../client';

//  TODO: Make this better
//  Enviroment constants
var dbPath = "mongodb://localhost/test",
    version = "0.0.0";

var app = express();
var server = new http.Server(app);

// Application Configuration
app.use(express.static(__dirname + STATIC_PATH));
app.use(bodyParser());
app.use(errorhandler({
      dumpExceptions: true,
      showStack: true
}));

// Connect to MongoDB
var db;
var chunks;
mongodb.MongoClient.connect(dbPath, function(err, database) {
    if (err) {
        throw err;  // burn server to ground
    }
    db = database;
    chunks = db.collection('chunks');

    server.listen(8080); // only listen once connected to db
});

// ROUTES
app.get('/api', function(req, res) {
    res.send('Annotations API is running');
});

// GET a chunk to annotate
app.get('/api/chunk', function(req, res) {
    var user_id = req.user_id;

    chunks.find().sort('[')

    return ChunkModel.find().sort('annotation_count').limit(1).exec(function (err, chunk) {
        if (!err) {
            return res.send(chunk);
        } else {
            return console.log(err);
        }
    });
});

// POST a new annotation
app.post('/api/annotation/:chunkid', function(req, res) {
    console.log("POST: ");
    console.log(req.body);

    var annotation = new AnnotationModel({
        user_id: req.body.user_id,
        ranges: req.body.ranges,
        meta: {
            // version: req.body.version,
            timestamp: Date.now()
        }
    });

    console.log(annotation);

    var chunkID = req.body.chunk_id;    // should actually get from url?

    return ChunkModel.update({_id: chunkID}, 
        {$push: {annotations: annotation}, $inc: {annotation_count: 1}}, 
    function(err, number, raw) {
        if (!err) {
            console.log(raw);
        } else {
            console.log(err);
        }
    });
});