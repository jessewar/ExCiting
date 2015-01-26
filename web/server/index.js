/// <reference path='./ts-definitions/node.d.ts' />
/// <reference path='./ts-definitions/express.d.ts' />
var express = require('express');
// import session = require('express-session');
var http = require('http');
// var STATIC_PATH : string = '../client';
var app = express();
var server = new http.Server(app);
// Use the static path directory to serve our website
// app.use(express.static(__dirname + STATIC_PATH));
app.get("/", function (req, res) {
    res.send("We're running.");
});
server.listen(80);
