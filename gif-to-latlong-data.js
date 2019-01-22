
var lwip = require("lwip");
var fs   = require("fs");
var path = require("path");

var source = process.argv[2];
var out    = process.argv[3];

var usage = `
Usage:
  gtld <source-image> <output-file>
`.trim();

// Exit and display usage instructions
if (!source || !out) {
  console.log(usage);
  process.exit();
}

if (!path.isAbsolute(out)) {
  out = path.join(process.cwd(), out);
}

var OUT_DATA        = "";
var dataEntries     = 0;
var processedPixels = 0;

console.log("GTLD: Converting...\n");
lwip.open(source, processImage);

// Utilities
function processImage(err, img) {
  var startX = 14;
  var startY = 36;
  var width  = 973;
  var height = 445;
  var endX   = startX + width + 1;
  var endY   = startY + height + 1;
  
  var hueMin = 0;
  var hueMax = 298;
  
  // Value mapping, from lowest to highest
  var valueMapping = [
    "L",
    "LM",
    "M",
    "H",
    "VH"
  ];
  
  var maxValue    = valueMapping.length;
  var minValueSym = valueMapping[0];
  
  console.time("Convert geo data time");
  for (var ix=startX; ix<endX; ix++) {
    for (var iy=startY; iy<endY; iy++) {
      var pixel = img.getPixel(ix, iy);
      var hsv   = RGB2HSV(pixel.r, pixel.g, pixel.b);
      
      if (hsv.s && hsv.v > 0.9) {
        var pointX = ix * (360 / width) - 180;
        var pointY = -iy * (180 / height) + 90;
        var hue    = Math.max(hsv.h, 0);
        
        if (pointX <= 180 && pointX >= -180) {
          if (hue >= hueMax) {
            var factor = minValueSym;
          } else {
            var factor = valueMapping[Math.floor((0.999 - (hue / hueMax)) * maxValue)];
          }
          
          // console.log(pointX, pointY, factor, hue, Math.floor((0.999 - (hue / hueMax)) * maxValue));
          OUT_DATA += `${ pointX } ${ pointY } ${ factor }\n`;
          dataEntries++;
        }
      }
      
      processedPixels++;
    }
  }
  console.timeEnd("Convert geo data time");
  
  // Save file
  fs.writeFileSync(out, OUT_DATA, {
    encoding: "utf8"
  });

  // Finished
  console.log("Processed pixels:      " + processedPixels);
  console.log("Data entries:          " + dataEntries);
  console.log("Written to file:       " + out);
}

function RGB2HSV(r, g, b) {
    // Check if a greyscale color
    if (r === g && g === b)
      return {h: 0, s: 0, v: r / 255};
    
    r = r / 255;
    g = g / 255;
    b = b / 255;
    
    var names = [r + "r", g + "g", b + "b"];
    
    // Sort for biggest channel
    var sortn = [names[0], names[1], names[2]].sort(function(a, b) {return parseFloat(a) < parseFloat(b) ? 1 : -1;});
    var sort  = sortn.map(function(i){return parseFloat(i);});
    sortn = sortn.map(function(i){return i.substr(-1);});
    
    var saturation = (sort[0] - sort[2]) / sort[0];
    var value = sort[0] / 1;
    
    var chroma = sort[0] - sort[2];
    var hue = 60;
    
    switch (sortn[0]) {
      case "r":
        hue *= ((g - b) / chroma) % 6;
      break;
      case "g":
        hue *= (b - r) / chroma + 2;
      break;
      case "b":
        hue *= (r - g) / chroma + 4;
      break;
    }
    
    return {h: hue, s: saturation, v: value};
}
