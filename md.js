start();

function start() {
  if (window.disableMarkdownProcessing) {
    setTimeout(function () {
      // preload site.css for subsequent pages to be faster
      loadCSS();
    }, 4000);
    return;
  }

  loadCSS();
  loadMarkedScript();
  document.write('<!--');
  window.onload = processMarkdown;

  function loadMarkedScript() {
    var markedScriptElem = document.createElement('script');
    markedScriptElem.src =
      (/http/i.test(location.protocol || '') ? '//' : 'http://') +
      'unpkg.com/marked';

    var latestScript = document.scripts[document.scripts.length - 1];
    latestScript.parentElement.appendChild(markedScriptElem);
  }

  function loadCSS() {
    var prefix = '';
    for (var i = 0; i < document.scripts.length; i++) {
      var scr = document.scripts[i];
      if (/md\.js/i.test(scr.src || '')) {
        prefix = scr.src.replace(/md\.js[\s\S]*$/i, '');
      }
    }

    var siteLink = document.createElement('link');
    siteLink.rel = 'stylesheet';
    siteLink.href = prefix + 'site.css';
    var latestScript = document.scripts[document.scripts.length - 1];
    latestScript.parentElement.appendChild(siteLink);
  }
}

function processMarkdown() {
  if (typeof marked === 'undefined' || !marked) {
    return failedToLoadMarked();
  }

  var toHTML = typeof marked === 'function' ? marked : marked.marked;
  var markdown = extractCommentContent();
  var html = toHTML(markdown, { smartypants: true });

  injectHead();

  var container = document.createElement('div');
  container.id = 'container';
  container.className = 'path-' +
    (location.pathname
      .replace(/^\/+/, '').replace(/\/+$/, '')
      || 'index.html'
    )
      .replace(/\.[a-z0-9]+$/, '').replace(/\.+/g, '-')
      .replace(/\/+/g, '-');
  container.className += ' document-' + container.className.split('-').reverse()[0];
  container.innerHTML = html;
  
  document.body.appendChild(container);

  var header = document.body.querySelector &&
    (document.body.querySelector('h1') || document.body.querySelector('h2'));
 
  if (header) document.title = (header.textContent || header.innerText) + ' - \uD835\uDD46\ud835\udd50\ud835\udd40\u2115.\ud835\udd39\ud835\udd46';
    
  function extractCommentContent() {
    var wholeHTML = document.body.parentElement.outerHTML;
    var commentOpen = wholeHTML.indexOf('<' + '!--');
    var commentClose = wholeHTML.lastIndexOf('--' + '>');
    var inner = wholeHTML.slice(commentOpen + 4, commentClose);
    return inner;
  }

  function failedToLoadMarked() {
    var el = document.createElement('h2');
    el.textContent = el.innerText = 'Marked library code failed to load: ' + typeof marked;
    document.body.appendChild(el);
  }

  function injectHead() {
    var head = document.createElement('div');
    head.id = 'head';
    var linkHome = document.createElement('a');
    linkHome.style.cssText = 'color: inherit; text-decoration: inherit; font: inherit;';
    linkHome.textContent = linkHome.innerText = 'OYIN.BO';
    linkHome.href = /file/i.test(location.protocol || '') ? './index.html' : '/';
    head.appendChild(linkHome);
    document.body.appendChild(head);
  }

}
