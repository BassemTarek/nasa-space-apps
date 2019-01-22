function dataToPointDensity(data, scale) {
  var points = [];
  var maxRes = data.resolutions[data.resolutions.length - 1];
  var resMap = data.map[maxRes];
  
  var resMaxY = resMap.length;
  var resMaxX = resMap.length;
  
  var latMin  = data.bounds.minX;
  var longMin = data.bounds.minY;
  var rangeX  = data.rangeX;
  var rangeY  = data.rangeY;
  
  for (var iy=0; iy<resMaxY; iy++) {
    var resRow = resMap[iy];
    
    for (var jx=0; jx<resMaxX; jx++) {
      var cell = resRow[jx];
      
      var pointCount = Math.ceil(cell.factor / scale);
      var pointX     = latMin + ((jx / resMaxX) * rangeX);
      var pointY     = longMin + ((1 - (((iy / resMaxY) * rangeY) / rangeY)) * rangeY);
      
      for (var k=0; k<pointCount; k++) {
        points.push([pointY, pointX]);
      }
    }
  }
  
  return points;
}

module.exports = dataToPointDensity;
