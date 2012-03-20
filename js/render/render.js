var consoleTest = /(^.|\b)console\./;

var useCustomConsole = !(function () {
  var ok = typeof window.console !== 'undefined';
  try {
    window.console.log('jsbin init test');
  } catch (e) {
    ok = false;
  }
  return ok;
})();

var re = {
  docReady: /\$\(document\)\.ready/,
  console: /(^.|\b)console\./g,
  script: /<\/script/ig,
  code: /%code%/,
  title: /<title>(.*)<\/title>/i,
  winLoad: /window\.onload\s*=/
}

function getPreparedCode() {
  var parts = [],
      source = '',
      js = '';
  
  try {
    source = editors.html.getCode();
  } catch (e) {}
  
  try {
    js = editors.javascript.getCode();
  } catch (e) {}

  // redirect JS console logged to our custom log while debugging
  if (consoleTest.test(js)) {
    if (useCustomConsole) {
      js = js.replace(re.console, '_console.');
    } else {
      js = js.replace(re.console, 'window.top.console.');
    }
  }
  
  // escape any script tags in the JS code, because that'll break the mushing together
  js = js.replace(re.script, '<\\/script');

  // note that I'm using split and reconcat instead of replace, because if the js var
  // contains '$$' it's replaced to '$' - thus breaking Prototype code. This method
  // gets around the problem.
  if (!$.trim(source)) {
    source = "<pre>\n" + js + "</pre>";
  } else if (re.code.test(source)) {
    parts = source.split('%code%');
    source = parts[0] + js + parts[1];
  } else if (js) {
    var close = '';
    if (source.indexOf('</body>') !== -1) {
      parts.push(source.substring(0, source.lastIndexOf('</body>')))
      parts.push(source.substring(source.lastIndexOf('</body>')));

      source = parts[0];
      close = parts.length == 2 && parts[1] ? parts[1] : '';
    }
    if (useCustomConsole) {
      source += "<script src=\"http://jsbin.com/js/render/console.js\"></script>\n<script>\n";
    }
    // source += "<script>\ntry {\n" + js + "\n} catch (e) {" + (window.console === undefined ? '_' : 'window.top.') + "console.error(e)}\n</script>\n" + close;
    source += "<script>\n" + js + "\n</script>\n" + close;
  }

  // specific change for rendering $(document).ready() because iframes doesn't trigger ready (TODO - really test in IE, may have been fixed...)
  if (re.docReady.test(source)) {
    source = source.replace(re.docReady, 'window.onload = ');
  } 

  // read the element out of the source code and plug it in to our document.title
  var newDocTitle = source.match(re.title);
  if (newDocTitle !== null && newDocTitle[1] !== documentTitle) {
    documentTitle = newDocTitle[1];
    updateTitle(!/ \[unsaved\]/.test(document.title));
  }

  return source;
}

function renderPreview() {
  var doc = $('#preview iframe')[0], 
      win = doc.contentDocument || doc.contentWindow.document,
      source = getPreparedCode();

  // this setTimeout allows the iframe to be rendered before our code
  // runs - thus allowing us access to the innerWidth, et al
  setTimeout(function () {
    win.open();
    if (debug) {
      win.write('<pre>' + source.replace(/[<>&]/g, function (m) {
        if (m == '<') return '&lt;';
        if (m == '>') return '&gt;';
        if (m == '"') return '&quot;';
      }) + '</pre>');
    } else {
      win.write(source);
    }
    win.close();
  }
}
