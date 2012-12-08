// this is an empty HAR 1.2 object, for the complete structure see http://www.softwareishard.com/blog/har-12-spec/
var adhoc = {
  log: {
    version : "1.2",
    creator : {
      name : "adHoc",
      version : "0.1",
      comment : ""
    },
    browser : {},
    pages : [],
    entries : [],
    comment : ""
  }
}

function fillEntries(adhoc, parentPage) {
  var entries = [],
    tdns = 0,
    tconnect = 0,
    tsend = 0,
    treceive = 0,
    twait = 0,
    ttime = 0,
    nextFrame = 0;
  if (!!window.performance.getEntries) {
    var rl = window.performance.getEntries(),
      t = {},
      d, fileSize, httpStatus, httpText, url,
      imgs = document.images;

    for (var i in rl) {
      if (rl[i].name == "javascript:false" || rl[i].name == "javascript:false;" || rl[i].name == "about:blank") {
//alert("Skipping "+rl[i].name+" initiator="+rl[i].initiatorType);
        continue;
      }
      fileSize = -1;
      httpStatus = "200";
      httpText = "OK";
      url = (rl[i].name == 'document') ? document.URL : rl[i].name;
      if (rl[i].name == "document") {
        fileSize = document.fileSize
      }
      // a dumb check to see if fileSize is supported, of course you MUST have at least 1 image in your page
      if (!!imgs[0].fileSize && rl[i].initiatorType == "img") {
        for (ii=0;ii<imgs.length;ii++) {
          if (imgs[ii].src == rl[i].name) {
            // it looks like fileSize is -1 when image is loaded from cache. Not documented
            if (imgs[ii].fileSize == -1) {
              fileSize = 0;
              httpStatus = "304";
              httpText = "Not Modified";
            } else {
              fileSize = imgs[ii].fileSize;
            }
          }
        }
      }
      d = new Date(Math.round(window.performance.timing.navigationStart+rl[i].startTime));
      // some of the values might be 0, so we need to check to avoid negative numbers
      nextFrame = rl[i].startTime;
      tdns = (rl[i].domainLookupEnd) ? Math.round(rl[i].domainLookupEnd-rl[i].startTime) : 0;
      if (tdns) nextFrame = rl[i].connectStart;
      tconnect = (rl[i].connectEnd) ? Math.round(rl[i].connectEnd-nextFrame) : 0;
      if (tconnect) nextFrame = rl[i].requestStart;
      tsend = (rl[i].responseStart) ? Math.round(rl[i].responseStart-nextFrame) : 0;
      if (tsend) nextFrame = rl[i].responseStart;
      treceive = (rl[i].responseEnd) ? Math.round(rl[i].responseEnd-nextFrame) : 0;
      // There are two issues here, the timing API measures things HAR does not track and viceversa. There is also a chance of error with the rounding, so I am bulking up everything into the wait time. Not accurate, but the error is usually between -2 and +2ms, not big esp on mobile
      twait = Math.round(rl[i].duration) - tdns - tconnect - tsend - treceive ;
      ttime = Math.round(rl[i].duration);
      if (twait<0) {
        ttime = ttime-twait;  // if the rounding made twait below zero we need to fix the total time to match the sum because no timings can be below zero
        twait=0;
      }
      t = {
        pageref: parentPage,
        startedDateTime: d.toISOString(),
        time: ttime,
        request: {
          method: "GET",
          url: url,
          httpVersion: "HTTP/1.1",
          cookies: [],
          headers: [],
          queryString: [],
          headersSize: -1,
          bodySize: -1
        },
        response: {
          status: httpStatus,
          statusText: httpText,
          httpVersion: "HTTP/1.0",
          cookies: [],
          headers: [],
          content: {
            size: fileSize,
            compression: 0,
            mimeType: "",
          },
          redirectURL: "",
          headersSize: -1,
          bodySize: fileSize
        },
        cache: {},
        timings: {
          blocked: -1,
          dns: tdns,
          connect: tconnect,
          send: tsend,
          wait: twait,
          receive: treceive,
        }
      }
      entries.push(t);
    }
  }
  return entries;
}

function generateHAR() {
  if (!!window.performance.timing && !!window.performance.getEntries) {
    var t = window.performance.timing;
    var sdt = new Date(t.navigationStart);
    // Use PPK's BrowserDetect to pick up the browser name and version
    adhoc.log.browser.name = BrowserDetect.browser;
    adhoc.log.browser.version = ""+BrowserDetect.version;
    adhoc.log.browser.comment = navigator.userAgent;
    // pages is a list of the pages in the package, we have only 1 in this case
    adhoc.log.pages = [
      {
        startedDateTime : sdt.toISOString(),
        id : "page_0",
        title : document.title,
        pageTimings : {
          onContentLoad: t.domInteractive-t.navigationStart,
          onLoad: t.loadEventStart-t.navigationStart
        }
      }
    ];
    // use the Navigation Timing to fill pageTimings
    adhoc.log.entries = fillEntries(adhoc, "page_0");

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://logme.mobi/jsnt/harp/', false);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    // send the collected data as JSON
    xhr.send(JSON.stringify(adhoc));

    if (xhr.status === 200) {
      var result = xhr.responseText;
      if (result.match("^Success\.")) {
        // if HAR was saved correctly set the href of the second link so that the user can view it
        var link = document.getElementById('dVHAR');
        link.href = 'http://www.softwareishard.com/har/viewer/?inputUrl=http://logme.mobi/jsnt/harp/files/'+result.match(/[0-9a-f]{32}/gi);
        result = "Success";
      }
      alert("The remote server said: "+result);
      if (window.console) {
        console.log(xhr.responseText);
      }
    }
  } else {
      if (window.console) {
        console.log("Your browser does not support the Web Perf API's that we need");
      }
  }
}
