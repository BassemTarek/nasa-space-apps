// Author: Mike32
// Responsible for: Design over data mapping and overall solution

var fs = require("fs");

function indexData(sourceFile, valueMappings) {
  var txt = fs.readFileSync(sourceFile, {
    encoding: "utf8"
  });

  var minX = 0;
  var maxX = 0;
  var minY = 0;
  var maxY = 0;

  var matches = txt.match(/($|\n)\-?\d+\.\d+\s+-?\d+\.\d+/g);
  var whiteSpace = /\s+/;

  console.time("get-min-max-bounds");
  for (var i=0,l=matches.length; i<l; i++) {
    var xy = matches[i].trim().split(whiteSpace);
    
    var matchX = parseFloat(xy[0]);
    var matchY = parseFloat(xy[1]);
    
    minX = Math.min(minX, matchX);
    maxX = Math.max(maxX, matchX);
    
    minY = Math.min(minY, matchY);
    maxY = Math.max(maxY, matchY);
  }
  console.timeEnd("get-min-max-bounds");

  console.log({
    minX,
    maxX,
    minY,
    maxY,
    i
  });

  var resolutions = [
    4,
    16,
    256,
    65536
  ];

  var resMaps = {};
  var oldRes;
  var oldResSq;

  for (var res=0; res<resolutions.length; res++) {
    var curRes   = resolutions[res];
    var curResSq = Math.sqrt(curRes);
    var curArr   = resMaps[curRes] = [];
    var parArr   = resMaps[oldRes];
    
    if (curRes === 4) {
      for (var i=0; i<curResSq; i++) {
        var curRow = [];
        
        for (var j=0; j<curResSq; j++) {
          curRow.push({
            factor: 0,
            child: []
          });
        }
        
        curArr.push(curRow);
      }
    } else {
      for (var i=0; i<curResSq; i++) {
        var curRow = [];
        
        for (var j=0; j<curResSq; j++) {
          var cell = {
            factor: 0,
            child: []
          };
          
          var parCellX = Math.floor(j / oldResSq);
          var parCellY = Math.floor(i / oldResSq);
          var parCell  = parArr[parCellY][parCellX].child;
          
          var localX = j - (parCellX * oldResSq);
          var localY = i - (parCellY * oldResSq);
          
          if (!parCell[localY]) {
            parCell.push([]);
          }
          
          if (!parCell[localY][localX]) {
            parCell[localY].push([]);
          }
          parCell[localY][localX].push(cell);
          curRow.push(cell);
        }
        
        curArr.push(curRow);
      }
    }
    
    oldRes   = curRes;
    oldResSq = curResSq;
  }

  // Reindex matches
  var matches  = txt.match(/($|\n)\-?\d+\.\d+\s+-?\d+\.\d+\s+[A-Z]+/g);
  var resCount = resolutions.length;

  var rangeX = maxX - minX;
  var rangeY = maxY - minY;

  for (var i=0,l=matches.length; i<l; i++) {
    var values = matches[i].trim().split(whiteSpace);
    
    var val1 = parseFloat(values[0]);
    var val2 = parseFloat(values[1]);
    var val3 = valueMappings[values[2]];
    
    for (var j=resCount-1; j>-1; j--) {
      var res     = resolutions[j];
      var resSq   = Math.sqrt(res);
      var resData = resMaps[res];
      
      // var x = Math.min(Math.floor((1 - ((val1 - minX) / rangeX)) * res), res - 1);
      var x = Math.min(Math.floor(((val1 - minX) / rangeX) * resSq), resSq - 1);
      var y = Math.min(Math.floor((1 - ((val2 - minY) / rangeY)) * resSq), resSq - 1);
      
      var cell = resData[y][x];
      cell.factor += val3;
    }
  }

  // Update 4res factors
  var res4 = resMaps[4];
   
  for (var i=0; i<res4.length; i++) {
    var row       = res4[i];
    var rowFactor = 0;
    
    for (var j=0; j<row.length; j++) {
      rowFactor += row[j].factor;
    }
    
    row.factor = rowFactor;
  }
  
  // Done
  return {
    resolutions: resolutions,
    map: resMaps,
    
    bounds: {
      minX,
      minY,
      
      maxX,
      maxY
    },
    
    rangeX,
    rangeY
  };
}

// FREAKING REDUNDANT ONE INDICE X DIMENSION ARRAY
// ...
// Ugh...
module.exports = indexData;
