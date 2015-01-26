/// <reference path='./ts-definitions/node.d.ts' />
/// <reference path='./ts-definitions/express.d.ts' />

var express = require('express'),
  bodyParser = require('body-parser'),
  swig  = require('swig'),
  http = require('http'),
  mongoose = require('mongoose'),
  errorhandler = require('errorhandler');

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

// Schemas
var Schema = mongoose.Schema;

// Annotation Ranges
var Ranges = new Schema({
    start: {
        type: String,
        required: true
    },
    end: {
        type: String,
        required: true
    },
    startOffset: {
        type: Number,
        required: false
    },
    endOffset: {
        type: Number,
        required: false
    }
});

var Shape = new Schema({
    type: {
        type: String,
        required: true
    },
    geometry: {
        x: {
            type: Number,
            required: true
        },
        y: {
            type: Number,
            required: true
        },
        width: {
            type: Number,
            required: true
        },
        height: {
            type: Number,
            required: true
        }
    }
});

// Annotation Model
var Annotation = new Schema({
    id: {
        type: String,
        required: false
    },
    annotator_schema_version: {
        type: String,
        required: false,
        default: version
    },
    created: {
        type: Date,
        default: Date.now()
    },
    updated: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: false
    },
    text: {
        type: String,
        required: false
    },
    quote: {
        type: String,
        required: false
    },
    uri: {
        type: String,
        required: false
    },
    src: {
        type: String,
        required: false
    },
    shapes: [Shape],
    uuid: {
        type: String,
        required: false
    },
    parentIndex: {
        type: String,
        required: false
    },
    groups: [String],
    subgroups: [String],
    ranges: [Ranges],
    tags: [String],
    permissions: {
        read: [String],
        admin: [String],
        update: [String],
        delete: [String]
    }
});

var AnnotationModel = mongoose.model('Annotation', Annotation);

Annotation.pre('save', function(next) {
    this.id = this._id;
    next();
});

// DB
mongoose.connect(dbPath);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("databse opened!");
});
app.get("/", function(req, res) {
  // res.render("index.html")
  res.redirect("index.html");
});

app.get("/store/annotations/", function(req, res) {
  console.log(req);
  res.send("Got it!");
});




// ROUTES
app.get('/api', function(req, res) {
    res.send('Annotations API is running');
});

server.listen(8080); // Dev server

// server.listen(80); // Live server