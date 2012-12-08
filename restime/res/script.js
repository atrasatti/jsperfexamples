// verify if the browser supports the needed API's
function featureDetect() {
  var rt = "Oh rats! Your browser does not support the Resource Timing spec :(";
  var pt = "Oh rats! Your browser does not support the Performance Timeline spec :(";

  if (!!window.performance.getEntries) {
    pt = "Excellent! Your browser supports the Performance Timing spec";
    var e = window.performance.getEntries();
      for (var i in e) {
      rt = "Excellent! Your browser supports the Resource Timing spec";
      document.getElementById('myButton2').disabled=false;
      document.getElementById('myButton3').disabled=false;
    }
  }
  document.getElementById('perf_support').innerHTML = document.getElementById('perf_support').innerHTML + rt + "<br>" + pt + "<br>" + "<br>";
}

// load an additional image
function loadResources() {
  var image = new Image();
  image.id = 'image' + (document.getElementById('images').childNodes.length/2 - 1);
  image.src = 'http://logme.mobi/jsnt/slowimg.php/res/image2.jpg';
  if (0 && !!window.performance.getEntriesByType) {
    image.onload = resourceTiming();
  }
  document.getElementById('images').appendChild(image);
  document.getElementById('images').appendChild(document.createElement('br'));
  document.getElementById('myButton').disabled=true;
}

// display timing information about page resources
function resourceTiming() {
   var resourceList = window.performance.getEntriesByType("resource");
   for (i = 0; i < resourceList.length; i++) {
      if (resourceList[i].initiatorType == "img") {
//         alert("It took about "+ Math.round(resourceList[i].responseEnd - resourceList[i].startTime) + " ms to fetch " + resourceList[i].name);
         alert("It took about "+ Math.round(resourceList[i].duration) + " ms to fetch " + resourceList[i].name);
      }
   }
}

function displayPerfData() {
  if (!!window.performance.getEntries) {
    var perf_data = loadPerfTimeData();
    document.getElementById('perf_data').innerHTML = "" + perf_data + "<br>" + "<br>";
  }
}

function loadPerfTimeData() {
  var e = window.performance.getEntries();
  var perf_data = "<table id='table_perf_data'><thead><tr><td>Resource</td><td>Start time (ms)</td><td>Duration (ms)</td></tr></thead>\n<tbody>\n";
  for (var i in e) {
    if (e[i].name == "document") {
      perf_data = perf_data + "<tr><td>HTML document</td>";
    } else {
      perf_data = perf_data + "<tr><td>"+e[i].name.replace(/^.*\/|\.$/g, '')+"</td>";
    }
    perf_data = perf_data + "<td>"+e[i].startTime+"</td><td>"+e[i].duration+"</td></tr>\n";
  }
  perf_data = perf_data + "</tbody>\n</table>\n";
  return perf_data;
}

function displayDetailedPerfData() {
  if (!!window.performance.getEntries) {
    var d = loadResTimData();
    document.getElementById('detailed_perf_data').innerHTML = "" + d + "<br>" + "<br>";
  }
}

function loadResTimData() {
  var e = window.performance.getEntries();
  var perf_data = "<table id='table_perf_data'><thead><tr><td>Resource</td><td>Network (ms)</td><td>Request (ms)</td><td>Response (ms)</td></tr></thead>\n<tbody>\n";
  var t = [];
  for (var i in e) {
    if (e[i].name == "document") {
      // for the document refer to window.performance.timing instead, we skip it for this example
      continue;
    }
    perf_data = perf_data + "<tr><td>"+e[i].name.replace(/^.*\/|\.$/g, '')+"</td>";
    if (e[i].requestStart==0) {
      // resource is cached, some entries are zero, we default to fetchStart instead
      perf_data = perf_data + "<td>"+ Math.round(e[i].fetchStart - e[i].startTime) + "</td>";
    } else {
      perf_data = perf_data + "<td>"+ Math.round(e[i].requestStart - e[i].startTime) + "</td>";
    }
    perf_data = perf_data + "<td>"+ Math.round(e[i].responseStart - e[i].requestStart) + "</td>";
    perf_data = perf_data + "<td>"+ Math.round(e[i].responseEnd - e[i].responseStart) + "</td>";
    perf_data = perf_data + "</tr>\n";
  }
  perf_data = perf_data + "</tbody>\n</table>\n";
  return perf_data;
}
