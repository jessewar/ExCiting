/// <reference path='./ts-definitions/node.d.ts' />
/// <reference path='./ts-definitions/express.d.ts' />
var express = require('express'), bodyParser = require('body-parser'), swig = require('swig'), http = require('http'), mongoose = require('mongoose'), errorhandler = require('errorhandler');
// import session = require('express-session');
var STATIC_PATH = './../client';
//  TODO: Make this better
//  Enviroment constants
var dbPath = "mongodb://localhost/test", version = "0.0.0";
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
// Text Range
var TxtRange = new Schema({
    start: {
        type: Number,
        required: true
    },
    end: {
        type: Number,
        required: true
    },
    text: {
        type: String,
        required: true
    }
});
// Annotation
var Annotation = new Schema({
    user_id: {
        type: Number,
        required: true
    },
    ranges: [TxtRange],
    meta: {
        version: Number,
        timestamp: Date
    }
});
// Chunks
var Chunk = new Schema({
    citer_paper: {
        type: Number,
        required: true
    },
    cited_paper: {
        type: Number,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    citation_text: {
        type: String,
        required: true
    },
    annotations: [Annotation]
});
// Papers
var Paper = new Schema({
    _id: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: false // do we need this?
    }
});
var TextRangeModel = mongoose.model('TextRange', TxtRange);
var AnnotationModel = mongoose.model('Annotation', Annotation);
var ChunkModel = mongoose.model('Chunk', Chunk);
var PaperModel = mongoose.model('Paper', Paper);
// DB
mongoose.connect(dbPath);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("databse opened!");
});
app.get("/", function (req, res) {
    // res.render("index.html")
    res.redirect("index.html");
});
app.get("/store/annotations/", function (req, res) {
    console.log(req);
    res.send("Got it!");
});
// ROUTES
app.get('/api', function (req, res) {
    res.send('Annotations API is running');
});
// Routes taken straight from annotation-data-store
// all the annotations!
app.get('/api/annotations', function (req, res) {
    return AnnotationModel.find(function (err, annotations) {
        if (!err) {
            return res.send(annotations);
        }
        else {
            return console.log(err);
        }
    });
});
// Single annotation
app.get('/api/annotations/:id', function (req, res) {
    return AnnotationModel.findById(req.params.id, function (err, annotation) {
        if (!err) {
            return res.send(annotation);
        }
        else {
            return console.log(err);
        }
    });
});
// POST to CREATE
app.post('/api/annotations', function (req, res) {
    var annotation;
    console.log("POST: ");
    console.log(req.body);
    annotation = new AnnotationModel({
        user: req.body.user,
        username: req.body.username,
        consumer: "ExCiting Project",
        annotator_schema_version: req.body.annotator_schema_version,
        created: Date.now(),
        updated: Date.now(),
        text: req.body.text,
        ranges: req.body.ranges,
        permissions: req.body.permissions
    });
    console.log(annotation);
    annotation.save(function (err) {
        if (!err) {
            return console.log("Created annotation with uuid: " + req.body.uuid);
        }
        else {
            return console.log(err);
        }
    });
    annotation.id = annotation._id;
    return res.send(annotation);
});
// PUT to UPDATE
// Single update
app.put('/api/annotations/:id', function (req, res) {
    return AnnotationModel.findById(req.params.id, function (err, annotation) {
        annotation._id = req.body._id;
        annotation.id = req.body._id;
        annotation.user = req.body.user;
        annotation.username = req.body.username;
        annotation.consumer = "ExCiting Project";
        annotation.annotator_schema_version = req.body.annotator_schema_version;
        annotation.created = req.body.created;
        annotation.updated = Date.now();
        annotation.text = req.body.text;
        annotation.ranges = req.body.ranges;
        annotation.permissions = req.body.permissions;
        return annotation.save(function (err) {
            if (!err) {
                console.log("updated");
            }
            else {
                console.log(err);
            }
            return res.send(annotation);
        });
    });
});
// Remove an annotation
app.delete('/api/annotations/:id', function (req, res) {
    return AnnotationModel.findById(req.params.id, function (err, annotation) {
        return annotation.remove(function (err) {
            if (!err) {
                console.log("removed");
                return res.send(204, 'Successfully deleted annotation.');
            }
            else {
                console.log(err);
            }
        });
    });
});
server.listen(8080); // Dev server
// server.listen(80); // Live server 
