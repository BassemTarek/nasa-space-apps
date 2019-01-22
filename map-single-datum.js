function MapDatum(data, lat, long, lastMin) {
  var resolutions = data.resolutions;
  var maxCellScan = 1024; // Even number plz
  var outCoords   = {};
  var resultCell;
  
  var baseLatX = 0;
  var baseLatY = 0;
  
  // Make sure maxCellScan is an even number...
  maxCellScan -= maxCellScan % 2;
  
  var curCell;
  // var cellXArr     = []; // DEBUG
  // var realCellXArr = []; // DEBUG
  var rangeX   = data.rangeX;
  var rangeY   = data.rangeY;
  var curDiffX = lat - data.bounds.minX;
  var curDiffY = (1 - ((long - data.bounds.minY) / rangeY)) * rangeY;
  
  var curDiffXArr = [];
  var curDiffYArr = [];
  
  var oldLat  = lat;
  var oldLong = long;
  
  lat  = data.bounds.minX + (((lat - data.bounds.minX) / rangeX) * rangeX);
  long = data.bounds.minY + ((1 - ((lat - data.bounds.minY) / rangeY)) * rangeY);
  
  for (var i=0; i<resolutions.length; i++) {
    var res    = resolutions[i];
    var resSq  = Math.sqrt(res);
    var resMap = data.map[res];
    
    // Interim resolution
    var maxX = rangeX / (resSq / 2);
    var facX = (curDiffX / maxX);
    
    var maxY = rangeY / (resSq / 2);
    var facY = (curDiffY / maxY);
    
    var cellX = Math.floor(facX * (resSq));
    var cellY = Math.floor(facY * (resSq));
    
    if (i === resolutions.length - 1) {
      // We're at the last resolutions
      
      var beginX = Math.max(cellX - (maxCellScan / 2), 0);
      var endX   = Math.min(cellX + (maxCellScan / 2), resSq - 1);
      
      var beginY = Math.max(cellY - (maxCellScan / 2), 0);
      var endY   = Math.min(cellY + (maxCellScan / 2), resSq - 1);
      
      var curCell = null;
      var maxCellFactor = 0;
      var curCellX = 0;
      var curCellY = 0;
      
      var userCellFactor = 0;
      var userCellX      = 0;
      var userCellY      = 0;
      var minUserDist    = res * 2;
      
      for (var j=beginY; j<endY + 1; j++) {
        for (var k=beginX; k<endX + 1; k++) {
          var curTestCell = resMap[j][k];
          var userDist = Math.sqrt(Math.pow(k - cellX, 2) + Math.pow(j - cellY, 2));
          
          if (minUserDist > userDist && curTestCell.factor) {
            userCellFactor = curTestCell.factor;
            
            userCellX = k;
            userCellY = j;
          }
          
          if (curTestCell.factor > maxCellFactor) {
            curCell = curTestCell;
            maxCellFactor = curTestCell.factor;
            
            curCellX = k;
            curCellY = j;
          }
        }
      }
      
      // We got our cell, now return transform
      var newLat  = lat + ((curCellX - cellX) * (maxX / resSq));
      var newLong = oldLong - ((curCellY - cellY) * (maxY / resSq));
      
      // Closest water source available
      var userLat  = lat + ((userCellX - cellX) * (maxX / resSq));
      var userLong = oldLong - ((userCellY - cellY) * (maxY / resSq));
      
      return {
        userFactor: userCellFactor,
        userLat,
        userLong,
        factor: maxCellFactor,
        lat: newLat,
        long: newLong,
        oldLat: oldLat,
        oldLong: oldLong
      };
    } else {
      curDiffX = curDiffX - ((maxX / resSq) * cellX);
      curDiffY = curDiffY - ((maxY / resSq) * cellY);
    }
  }
}

module.exports = MapDatum;
