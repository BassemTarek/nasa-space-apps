// Get dependencies
var fs = require("fs");
var express = require("express");
var cruncher = require("./crunch-geo-data");
var reformater = require("./factor-to-points");
var mapper = require("./map-single-datum");

// Prepare data
var storage = cruncher("app-data/storage.txt", {
  L: 0,
  LM: 1000,
  M: 10000,
  H: 25000,
  VH: 50000
});

var storagePoints = reformater(storage, 250000);

var depth = cruncher("app-data/depth.txt", {
  L: 0,
  LM: 1000,
  M: 10000,
  H: 25000,
  VH: 50000
});

var depthPoints = reformater(depth, 250000);

var productivity = cruncher("app-data/productivity.txt", {
  VL: 0,
  L: 0.1,
  LM: 0.5,
  M: 1,
  H: 5,
  VH: 20
});

var productivityPoints = reformater(productivity, 55);

// var thickness = cruncher("app-data/thickness.txt", {
//   L: 0,
//   LM: 1000,
//   M: 10000,
//   H: 25000,
//   VH: 50000
// });
//
// var thicknessPoints = reformater(thickness, 55);

// Initialize ExpressJS
var app = express();

// Get static files
app.use(express.static("app-public"));

var html = fs.readFileSync("app-public/index.html", {
  encoding: "utf8"
});
app.get("/", function(req, res) {
  res.send(html);
});

app.get(/\/+ajaj\/+([a-z_]+)\/+(-?\d+(?:\.\d+))\/+(-?\d+(?:\.\d+)?)\/*/, function(req, res) {
  var params = req.originalUrl.match(/\/+ajaj\/+([a-z_]+)\/+(-?\d+(?:\.\d+))\/+(-?\d+(?:\.\d+)?)\/*/);
  
  console.log(params, req.originalUrl);
  var lat  = parseFloat(params[2]);
  var long = parseFloat(params[3]);
  var map;
  var data;
  
  switch (params[1]) {
    case "water_storage":
      map = mapper(storage, lat, long);
      data = storagePoints;
      break;
    case "water_depth":
      map = mapper(depth, lat, long);
      data = depthPoints;
      break;
    case "water_productivity":
      map = mapper(productivity, lat, long);
      data = productivityPoints;
      break;
    case "water_thickness":
      map = mapper(thickness, lat, long);
      data = thicknessPoints;
      break;
  }
  
  if (map) {
    res.send(JSON.stringify({
      meta: map,
      data: data
    }));
  } else {
    res.send({
      error: "Map " + params[1] + " doesn't exist"
    });
  }
});

app.listen(3000, function() {
  console.log("Code It SERVER: Listening on port 3000");
});
